import {
  parseSeasonNumberFromText,
  stripSeasonFromTitle,
  titleMentionsSeason,
} from '@/shared/utils/resolveAnimeSeasonLabel';

import { tvdbFetchJson, tvdbSearchUrl } from './tvdbApi';
import type { TvdbSearchHit } from './tvdbTypes';

const MIN_TVDB_TITLE_SCORE = 24;
const STOP_WORDS = new Set(['the', 'and', 'of', 'a', 'an']);

function normalizeTitle(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** TVDB only: cour in title is not a TV season index (e.g. Dr. Stone S4 cour 3 → season 4). */
export function resolveTvdbSeasonNumber(input: {
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

export function hitMentionsSeason(hit: TvdbSearchHit, season: number): boolean {
  return hitTitleCandidates(hit).some((candidate) => titleMentionsSeason(candidate, season));
}

function tokenizeForMatch(value: string): string[] {
  return normalizeTitle(value)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

function scoreHitTitleMatch(
  query: string,
  franchiseBase: string | undefined,
  hit: TvdbSearchHit,
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

export function pickBestSeriesHit(
  hits: TvdbSearchHit[],
  query: string,
  preferSeason?: number | null,
  franchiseBase?: string,
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

export function seriesIdFromHit(hit: TvdbSearchHit): string | null {
  if (hit.tvdb_id?.trim()) return hit.tvdb_id.trim();
  const raw = hit.id?.trim();
  if (!raw) return null;
  return raw.startsWith('series-') ? raw.slice('series-'.length) : raw;
}

export async function searchTvdbSeriesHit(
  token: string,
  query: string,
  preferSeason?: number | null,
  franchiseBase?: string,
): Promise<TvdbSearchHit | null> {
  const q = query.trim();
  if (!q) return null;

  const searchJson = await tvdbFetchJson<{ data?: TvdbSearchHit[] }>(
    tvdbSearchUrl(q),
    token,
    60 * 60 * 24,
  );
  return pickBestSeriesHit(searchJson?.data ?? [], query, preferSeason, franchiseBase);
}
