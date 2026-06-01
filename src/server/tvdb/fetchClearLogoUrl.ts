import { unstable_cache } from 'next/cache';
import {
  buildTvdbSearchTitles,
  parseSeasonNumberFromText,
  resolveSpotlightSeasonLabel,
  stripSeasonFromTitle,
  titleMentionsSeason,
} from '@/shared/utils/resolveAnimeSeasonLabel';

const TVDB_API = 'https://api4.thetvdb.com/v4';

interface TvdbLoginResponse {
  data?: { token?: string };
}

interface TvdbSearchHit {
  tvdb_id?: string;
  id?: string;
  name?: string;
  type?: string;
  primary_type?: string;
  translations?: Record<string, string>;
  aliases?: string[] | Array<{ name?: string; language?: string }>;
}

interface TvdbArtwork {
  image?: string;
  type?: number;
  score?: number;
  width?: number;
  height?: number;
}

/** TVDB v4: 1 = banner, 2 = poster, 3 = background / fanart */
const TVDB_ARTWORK_BACKGROUND = 3;
const TVDB_ARTWORK_BANNER = 1;

const MIN_HERO_PIXEL_AREA = 1280 * 720;

export interface TvdbClearLogoResult {
  url: string | null;
  /** Found series whose title includes season number. */
  matchedSeasonSpecific: boolean;
}

export interface TvdbSpotlightArtworkResult {
  clearLogoUrl: string | null;
  heroImageUrl: string | null;
  matchedSeasonSpecific: boolean;
}

let cachedToken: { value: string; until: number } | null = null;

function getTvdbApiKey(): string | null {
  const key = process.env.TVDB_API_KEY?.trim();
  return key || null;
}

async function tvdbLogin(apiKey: string): Promise<string | null> {
  if (cachedToken && Date.now() < cachedToken.until) {
    return cachedToken.value;
  }

  try {
    const res = await fetch(`${TVDB_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey: apiKey }),
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const json = (await res.json()) as TvdbLoginResponse;
    const token = json.data?.token?.trim();
    if (!token) return null;

    cachedToken = { value: token, until: Date.now() + 23 * 60 * 60 * 1000 };
    return token;
  } catch {
    return null;
  }
}

function normalizeTitle(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** TVDB only: cour in title is not a TV season index (e.g. Dr. Stone S4 cour 3 → season 4). */
function resolveTvdbSeasonNumber(input: {
  title: string;
  description?: string;
  synonyms?: string[];
}): number | null {
  const fromDescription = parseSeasonNumberFromText(input.description);
  if (fromDescription !== null) return fromDescription;

  for (const synonym of input.synonyms ?? []) {
    const fromSynonym = parseSeasonNumberFromText(synonym);
    if (fromSynonym !== null) return fromSynonym;
  }

  const t = input.title.trim();
  const courOnly =
    /\bcour\s+\d{1,2}\b/i.test(t) &&
    !/\bseason\s+\d{1,2}\b/i.test(t) &&
    !/\b\d{1,2}(?:st|nd|rd|th)\s+season\b/i.test(t);
  if (courOnly) return null;

  return parseSeasonNumberFromText(input.title);
}

function hitIsSeries(hit: TvdbSearchHit): boolean {
  const t = (hit.type ?? hit.primary_type ?? '').toLowerCase();
  return t === 'series';
}

function hitTitleCandidates(hit: TvdbSearchHit): string[] {
  const out: string[] = [];
  const push = (s: string | undefined) => {
    const t = s?.trim();
    if (t) out.push(normalizeTitle(t));
  };

  push(hit.name);
  push(hit.translations?.eng);
  push(hit.translations?.en);

  if (Array.isArray(hit.aliases)) {
    for (const alias of hit.aliases) {
      if (typeof alias === 'string') push(alias);
      else push(alias.name);
    }
  }

  return out;
}

function hitMentionsSeason(hit: TvdbSearchHit, season: number): boolean {
  return hitTitleCandidates(hit).some((candidate) =>
    titleMentionsSeason(candidate, season)
  );
}

const STOP_WORDS = new Set(['the', 'and', 'of', 'a', 'an']);

function tokenizeForMatch(value: string): string[] {
  return normalizeTitle(value)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

/** Score how well a TVDB series title matches our anime (avoid Pokémon on "Season 3" alone). */
function scoreHitTitleMatch(
  query: string,
  franchiseBase: string | undefined,
  hit: TvdbSearchHit
): number {
  const queries = [query, franchiseBase].filter((q): q is string => Boolean(q?.trim()));
  const candidates = hitTitleCandidates(hit);
  let best = 0;

  for (const q of queries) {
    const tokens = tokenizeForMatch(q);
    if (!tokens.length) continue;

    for (const candidate of candidates) {
      let score = 0;
      for (const token of tokens) {
        if (candidate.includes(token)) score += 12;
      }
      if (tokens.length >= 2 && tokens.every((token) => candidate.includes(token))) {
        score += 24;
      }
      best = Math.max(best, score);
    }
  }

  return best;
}

const MIN_TVDB_TITLE_SCORE = 24;

function pickBestSeriesHit(
  hits: TvdbSearchHit[],
  query: string,
  preferSeason?: number | null,
  franchiseBase?: string
): TvdbSearchHit | null {
  const series = hits.filter(hitIsSeries);
  if (!series.length) return null;

  const want = normalizeTitle(query);
  const base = franchiseBase?.trim() ? normalizeTitle(franchiseBase) : '';

  const rank = (hit: TvdbSearchHit) => {
    const titleScore = scoreHitTitleMatch(query, franchiseBase, hit);
    const seasonMatch =
      preferSeason && preferSeason >= 1 ? hitMentionsSeason(hit, preferSeason) : false;
    const exact =
      hitTitleCandidates(hit).includes(want) ||
      (base.length > 0 && hitTitleCandidates(hit).includes(base));
    return { hit, titleScore, seasonMatch, exact };
  };

  const ranked = series.map(rank).filter((r) => r.titleScore >= MIN_TVDB_TITLE_SCORE);

  if (!ranked.length) return null;

  ranked.sort((a, b) => {
    if (a.exact !== b.exact) return a.exact ? -1 : 1;
    if (a.seasonMatch !== b.seasonMatch) return a.seasonMatch ? -1 : 1;
    return b.titleScore - a.titleScore;
  });

  return ranked[0]?.hit ?? null;
}

function seriesIdFromHit(hit: TvdbSearchHit): string | null {
  if (hit.tvdb_id?.trim()) return hit.tvdb_id.trim();
  const raw = hit.id?.trim();
  if (!raw) return null;
  return raw.startsWith('series-') ? raw.slice('series-'.length) : raw;
}

function isTvdbThumbnailUrl(url: string): boolean {
  return /_t\.(jpg|jpeg|png|webp)$/i.test(url);
}

function artworkPixelArea(art: TvdbArtwork): number {
  const w = art.width ?? 0;
  const h = art.height ?? 0;
  return w > 0 && h > 0 ? w * h : 0;
}

function compareArtworksForHero(a: TvdbArtwork, b: TvdbArtwork): number {
  const areaA = artworkPixelArea(a);
  const areaB = artworkPixelArea(b);
  const aMeets = areaA >= MIN_HERO_PIXEL_AREA;
  const bMeets = areaB >= MIN_HERO_PIXEL_AREA;
  if (aMeets !== bMeets) return aMeets ? -1 : 1;
  if (areaA !== areaB) return areaB - areaA;

  const typeRank = (type: number) =>
    type === TVDB_ARTWORK_BACKGROUND ? 2 : type === TVDB_ARTWORK_BANNER ? 1 : 0;
  const typeDiff = typeRank(b.type ?? 0) - typeRank(a.type ?? 0);
  if (typeDiff !== 0) return typeDiff;

  return (b.score ?? 0) - (a.score ?? 0);
}

function isHeroBackdropCandidate(art: TvdbArtwork): boolean {
  const url = art.image?.trim();
  if (!url || isTvdbThumbnailUrl(url)) return false;

  const type = art.type ?? 0;
  if (type === TVDB_ARTWORK_BACKGROUND) return true;

  if (type === TVDB_ARTWORK_BANNER) {
    const area = artworkPixelArea(art);
    if (area >= MIN_HERO_PIXEL_AREA) return true;
    const w = art.width ?? 0;
    const h = art.height ?? 0;
    return w > h && w >= 1000;
  }

  return url.includes('/fanart/original/');
}

function pickClearLogoFromArtworks(artworks: TvdbArtwork[]): string | null {
  const clear = artworks.filter((art) => art.image?.includes('/clearlogo/'));
  if (!clear.length) return null;

  clear.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return clear[0]?.image?.trim() ?? null;
}

function pickHeroBackdropFromArtworks(artworks: TvdbArtwork[]): string | null {
  const candidates = artworks.filter(isHeroBackdropCandidate);
  if (!candidates.length) return null;

  candidates.sort(compareArtworksForHero);
  return candidates[0]?.image?.trim() ?? null;
}

function pickSpotlightArtworkFromList(
  artworks: TvdbArtwork[]
): Pick<TvdbSpotlightArtworkResult, 'clearLogoUrl' | 'heroImageUrl'> {
  return {
    clearLogoUrl: pickClearLogoFromArtworks(artworks),
    heroImageUrl: pickHeroBackdropFromArtworks(artworks),
  };
}

async function tvdbFetchJson<T>(
  url: string,
  token: string,
  revalidateSeconds: number
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function searchTvdbSeriesHit(
  token: string,
  query: string,
  preferSeason?: number | null,
  franchiseBase?: string
): Promise<TvdbSearchHit | null> {
  const q = encodeURIComponent(query.trim());
  if (!q) return null;

  const searchJson = await tvdbFetchJson<{ data?: TvdbSearchHit[] }>(
    `${TVDB_API}/search?query=${q}&limit=25`,
    token,
    60 * 60 * 24
  );
  return pickBestSeriesHit(searchJson?.data ?? [], query, preferSeason, franchiseBase);
}

async function fetchSeriesArtworks(
  token: string,
  seriesId: string
): Promise<TvdbArtwork[]> {
  const artJson = await tvdbFetchJson<{
    data?: { artworks?: TvdbArtwork[] } | TvdbArtwork[];
  }>(`${TVDB_API}/series/${seriesId}/artworks`, token, 60 * 60 * 24 * 7);

  const raw = artJson?.data;
  return Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.artworks)
      ? raw.artworks
      : [];
}

async function tryQueryForSpotlightArtwork(
  token: string,
  query: string,
  season: number | null,
  requireSeasonInHit: boolean,
  franchiseBase: string
): Promise<TvdbSpotlightArtworkResult | null> {
  const hit = await searchTvdbSeriesHit(token, query, season, franchiseBase);
  if (!hit) return null;

  const mentionsSeason = season ? hitMentionsSeason(hit, season) : false;
  if (requireSeasonInHit && season && !mentionsSeason) return null;

  const seriesId = seriesIdFromHit(hit);
  if (!seriesId) return null;

  const artworks = await fetchSeriesArtworks(token, seriesId);
  const { clearLogoUrl, heroImageUrl } = pickSpotlightArtworkFromList(artworks);
  if (!clearLogoUrl && !heroImageUrl) return null;

  return {
    clearLogoUrl,
    heroImageUrl,
    matchedSeasonSpecific: Boolean(season && mentionsSeason),
  };
}

const emptySpotlightArtwork: TvdbSpotlightArtworkResult = {
  clearLogoUrl: null,
  heroImageUrl: null,
  matchedSeasonSpecific: false,
};

async function fetchSpotlightArtworkUncached(input: {
  title: string;
  malId?: number;
  description?: string;
  synonyms?: string[];
}): Promise<TvdbSpotlightArtworkResult> {
  const apiKey = getTvdbApiKey();
  if (!apiKey) return emptySpotlightArtwork;

  const token = await tvdbLogin(apiKey);
  if (!token) return emptySpotlightArtwork;

  const season = resolveTvdbSeasonNumber({
    title: input.title,
    description: input.description,
    synonyms: input.synonyms,
  });

  const searchTitles = buildTvdbSearchTitles({
    title: input.title,
    description: input.description,
    synonyms: input.synonyms,
  });

  const franchiseBase = stripSeasonFromTitle(input.title);

  if (season) {
    for (const query of searchTitles) {
      const hit = await tryQueryForSpotlightArtwork(
        token,
        query,
        season,
        true,
        franchiseBase
      );
      if (hit) return hit;
    }
  }

  for (const query of searchTitles) {
    const hit = await tryQueryForSpotlightArtwork(
      token,
      query,
      season,
      false,
      franchiseBase
    );
    if (hit) return hit;
  }

  if (input.malId && input.malId > 0) {
    const malSearch = await tvdbFetchJson<{ data?: TvdbSearchHit[] }>(
      `${TVDB_API}/search?query=${input.malId}&limit=10`,
      token,
      60 * 60 * 24 * 7
    );
    const malHit = pickBestSeriesHit(
      malSearch?.data ?? [],
      input.title,
      season,
      franchiseBase
    );
    const seriesId = malHit ? seriesIdFromHit(malHit) : null;
    if (seriesId) {
      const artworks = await fetchSeriesArtworks(token, seriesId);
      const picked = pickSpotlightArtworkFromList(artworks);
      if (picked.clearLogoUrl || picked.heroImageUrl) {
        return {
          ...picked,
          matchedSeasonSpecific: Boolean(
            season && malHit && hitMentionsSeason(malHit, season)
          ),
        };
      }
    }
  }

  return emptySpotlightArtwork;
}

export async function fetchTvdbSpotlightArtwork(input: {
  title: string;
  malId?: number;
  description?: string;
  synonyms?: string[];
}): Promise<TvdbSpotlightArtworkResult> {
  const title = input.title?.trim();
  if (!title) return emptySpotlightArtwork;
  if (!getTvdbApiKey()) return emptySpotlightArtwork;

  const cacheKey = [
    'tvdb-spotlight-art-v1',
    title.toLowerCase(),
    input.malId ? String(input.malId) : 'no-mal',
    input.description?.slice(0, 40) ?? '',
  ];

  return unstable_cache(
    () => fetchSpotlightArtworkUncached(input),
    cacheKey,
    { revalidate: 60 * 60 * 24 * 7 }
  )();
}

export async function fetchTvdbClearLogoUrl(input: {
  title: string;
  malId?: number;
  description?: string;
  synonyms?: string[];
}): Promise<TvdbClearLogoResult> {
  const result = await fetchTvdbSpotlightArtwork(input);
  return {
    url: result.clearLogoUrl,
    matchedSeasonSpecific: result.matchedSeasonSpecific,
  };
}

export async function enrichSpotlightsWithClearLogos<
  T extends {
    title: string;
    description?: string;
    malId?: number;
    clearLogoUrl?: string;
    heroImageUrl?: string;
    seasonLabel?: string;
    synonyms?: string[];
  },
>(spotlights: T[]): Promise<T[]> {
  if (!getTvdbApiKey()) return spotlights;

  return Promise.all(
    spotlights.map(async (spotlight) => {
      const synonyms = spotlight.synonyms;
      const { clearLogoUrl, heroImageUrl, matchedSeasonSpecific } =
        await fetchTvdbSpotlightArtwork({
          title: spotlight.title,
          malId: spotlight.malId,
          description: spotlight.description,
          synonyms,
        });

      const seasonLabel = resolveSpotlightSeasonLabel({
        title: spotlight.title,
        description: spotlight.description,
        synonyms,
        tvdbMatchedSeason: matchedSeasonSpecific,
      });

      return {
        ...spotlight,
        ...(clearLogoUrl ? { clearLogoUrl } : {}),
        ...(heroImageUrl ? { heroImageUrl } : {}),
        ...(seasonLabel ? { seasonLabel } : { seasonLabel: undefined }),
      };
    })
  );
}
