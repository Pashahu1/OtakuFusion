import { unstable_cache } from 'next/cache';
import {
  buildTvdbSearchTitles,
  resolveAnimeSeasonNumber,
  resolveSpotlightSeasonLabel,
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
}

export interface TvdbClearLogoResult {
  url: string | null;
  /** Знайдено серію, у назві якої є номер сезону. */
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

function pickBestSeriesHit(
  hits: TvdbSearchHit[],
  query: string,
  preferSeason?: number | null
): TvdbSearchHit | null {
  const series = hits.filter(hitIsSeries);
  if (!series.length) return null;

  const want = normalizeTitle(query);

  if (preferSeason && preferSeason >= 1) {
    const seasonal = series.filter((hit) => hitMentionsSeason(hit, preferSeason));
    if (seasonal.length) {
      const exactSeason = seasonal.find((hit) =>
        hitTitleCandidates(hit).includes(want)
      );
      return exactSeason ?? seasonal[0] ?? null;
    }
  }

  const exact = series.find((hit) => hitTitleCandidates(hit).includes(want));
  return exact ?? series[0] ?? null;
}

function seriesIdFromHit(hit: TvdbSearchHit): string | null {
  if (hit.tvdb_id?.trim()) return hit.tvdb_id.trim();
  const raw = hit.id?.trim();
  if (!raw) return null;
  return raw.startsWith('series-') ? raw.slice('series-'.length) : raw;
}

function pickClearLogoFromArtworks(artworks: TvdbArtwork[]): string | null {
  const clear = artworks.filter((art) => art.image?.includes('/clearlogo/'));
  if (!clear.length) return null;

  clear.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return clear[0]?.image?.trim() ?? null;
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
  preferSeason?: number | null
): Promise<TvdbSearchHit | null> {
  const q = encodeURIComponent(query.trim());
  if (!q) return null;

  const searchJson = await tvdbFetchJson<{ data?: TvdbSearchHit[] }>(
    `${TVDB_API}/search?query=${q}&limit=25`,
    token,
    60 * 60 * 24
  );
  return pickBestSeriesHit(searchJson?.data ?? [], query, preferSeason);
}

async function fetchClearLogoForSeries(
  token: string,
  seriesId: string
): Promise<string | null> {
  const artJson = await tvdbFetchJson<{
    data?: { artworks?: TvdbArtwork[] } | TvdbArtwork[];
  }>(`${TVDB_API}/series/${seriesId}/artworks`, token, 60 * 60 * 24 * 7);

  const raw = artJson?.data;
  const list: TvdbArtwork[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.artworks)
      ? raw.artworks
      : [];

  return pickClearLogoFromArtworks(list);
}

async function tryQueryForLogo(
  token: string,
  query: string,
  season: number | null,
  requireSeasonInHit: boolean
): Promise<{ url: string; matchedSeasonSpecific: boolean } | null> {
  const hit = await searchTvdbSeriesHit(token, query, season);
  if (!hit) return null;

  const mentionsSeason = season ? hitMentionsSeason(hit, season) : false;
  if (requireSeasonInHit && season && !mentionsSeason) return null;

  const seriesId = seriesIdFromHit(hit);
  if (!seriesId) return null;

  const url = await fetchClearLogoForSeries(token, seriesId);
  if (!url) return null;

  return { url, matchedSeasonSpecific: Boolean(season && mentionsSeason) };
}

async function fetchClearLogoUncached(input: {
  title: string;
  malId?: number;
  description?: string;
  synonyms?: string[];
}): Promise<TvdbClearLogoResult> {
  const empty: TvdbClearLogoResult = {
    url: null,
    matchedSeasonSpecific: false,
  };

  const apiKey = getTvdbApiKey();
  if (!apiKey) return empty;

  const token = await tvdbLogin(apiKey);
  if (!token) return empty;

  const season = resolveAnimeSeasonNumber({
    title: input.title,
    description: input.description,
    synonyms: input.synonyms,
  });

  const searchTitles = buildTvdbSearchTitles({
    title: input.title,
    description: input.description,
    synonyms: input.synonyms,
  });

  if (season) {
    for (const query of searchTitles) {
      const hit = await tryQueryForLogo(token, query, season, true);
      if (hit) return hit;
    }
  }

  for (const query of searchTitles) {
    const hit = await tryQueryForLogo(token, query, season, false);
    if (hit) return hit;
  }

  if (input.malId && input.malId > 0) {
    const malSearch = await tvdbFetchJson<{ data?: TvdbSearchHit[] }>(
      `${TVDB_API}/search?query=${input.malId}&limit=10`,
      token,
      60 * 60 * 24 * 7
    );
    const malHit = pickBestSeriesHit(malSearch?.data ?? [], input.title, season);
    const seriesId = malHit ? seriesIdFromHit(malHit) : null;
    if (seriesId) {
      const url = await fetchClearLogoForSeries(token, seriesId);
      if (url) {
        return {
          url,
          matchedSeasonSpecific: Boolean(
            season && malHit && hitMentionsSeason(malHit, season)
          ),
        };
      }
    }
  }

  return empty;
}

export async function fetchTvdbClearLogoUrl(input: {
  title: string;
  malId?: number;
  description?: string;
  synonyms?: string[];
}): Promise<TvdbClearLogoResult> {
  const title = input.title?.trim();
  if (!title) return { url: null, matchedSeasonSpecific: false };
  if (!getTvdbApiKey()) return { url: null, matchedSeasonSpecific: false };

  const cacheKey = [
    'tvdb-clearlogo-v4',
    title.toLowerCase(),
    input.malId ? String(input.malId) : 'no-mal',
    input.description?.slice(0, 40) ?? '',
  ];

  return unstable_cache(
    () => fetchClearLogoUncached(input),
    cacheKey,
    { revalidate: 60 * 60 * 24 * 7 }
  )();
}

export async function enrichSpotlightsWithClearLogos<
  T extends {
    title: string;
    description?: string;
    malId?: number;
    clearLogoUrl?: string;
    seasonLabel?: string;
    synonyms?: string[];
  },
>(spotlights: T[]): Promise<T[]> {
  if (!getTvdbApiKey()) return spotlights;

  return Promise.all(
    spotlights.map(async (spotlight) => {
      const synonyms = spotlight.synonyms;
      const { url, matchedSeasonSpecific } = await fetchTvdbClearLogoUrl({
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
        ...(url ? { clearLogoUrl: url } : {}),
        ...(seasonLabel ? { seasonLabel } : { seasonLabel: undefined }),
      };
    })
  );
}
