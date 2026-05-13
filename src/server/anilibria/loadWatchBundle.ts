import 'server-only';

import { unstable_cache } from 'next/cache';
import { getAnimeInfo } from '@/services/getAnimeInfo';
import {
  mapAnilibriaEpisodesToList,
  sortAnilibriaEpisodes,
  type AnilibriaEpisodeRaw,
} from '@/services/anilibria/episodeMapping';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { anilibriaFetchText } from './http';

interface AnilibriaSearchHit {
  id?: number;
  alias?: string;
  name?: { main?: string | null; english?: string | null; alternative?: string | null };
}

interface AnilibriaReleaseWithEpisodes {
  id?: number;
  alias?: string;
  name?: { main?: string | null; english?: string | null; alternative?: string | null };
  episodes?: AnilibriaEpisodeRaw[];
}

function normalizeComparableTitle(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\u0400-\u04FF]+/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function tokenizeComparable(input: string): string[] {
  const n = normalizeComparableTitle(input);
  if (!n) return [];
  return n.split(' ').filter((t) => t.length > 1);
}

function jaccardTokens(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const t of A) {
    if (B.has(t)) inter += 1;
  }
  const uni = A.size + B.size - inter;
  return uni ? inter / uni : 0;
}

/** Кілька рядків пошуку: romaji + англ. + native + синоніми — перший результат AniLiberty часто не той реліз. */
function buildAnilistSearchQueries(data: {
  romaji_title?: string;
  title: string;
  japanese_title: string;
  animeInfo?: { Japanese?: string; Synonyms?: string };
}): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (raw?: string | null) => {
    const t = raw?.trim();
    if (!t || t.length < 2) return;
    const slice = t.slice(0, 200);
    const key = slice.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(slice);
  };

  push(data.romaji_title);
  push(data.title);
  push(data.japanese_title);
  push(data.animeInfo?.Japanese);

  const syn = data.animeInfo?.Synonyms?.trim();
  if (syn) {
    const parts = syn.split(',').map((p) => p.trim()).filter((p) => p.length > 3);
    for (const p of parts.slice(0, 4)) {
      push(p);
    }
  }

  const slug = normalizeComparableTitle(data.romaji_title || data.title)
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length >= 6 && slug.includes('-')) {
    push(slug);
  }

  return out.slice(0, 8);
}

async function collectAnilibriaSearchHitsFromAnime(data: {
  romaji_title?: string;
  title: string;
  japanese_title: string;
  animeInfo?: { Japanese?: string; Synonyms?: string };
}): Promise<
  | { ok: true; hits: AnilibriaSearchHit[] }
  | { ok: false; error: string }
> {
  const queries = buildAnilistSearchQueries(data);
  if (!queries.length) {
    return { ok: false, error: 'no_search_query' };
  }

  const byAlias = new Map<string, AnilibriaSearchHit>();
  let lastFailStatus = 0;
  let anyRequestOk = false;

  for (const q of queries) {
    const searchParams = new URLSearchParams({
      query: q,
      include: 'id,alias,name',
    });
    const searchRes = await anilibriaFetchText(`/app/search/releases?${searchParams.toString()}`);
    if (!searchRes.ok) {
      lastFailStatus = searchRes.status;
      continue;
    }
    anyRequestOk = true;
    let list: unknown;
    try {
      list = JSON.parse(searchRes.text) as unknown;
    } catch {
      continue;
    }
    if (!Array.isArray(list)) continue;
    for (const h of list as AnilibriaSearchHit[]) {
      const alias = typeof h.alias === 'string' ? h.alias.trim() : '';
      if (!alias || byAlias.has(alias)) continue;
      byAlias.set(alias, h);
    }
  }

  if (!byAlias.size) {
    if (!anyRequestOk && lastFailStatus) {
      return { ok: false, error: `anilibria_search_${lastFailStatus}` };
    }
    return { ok: false, error: 'anilibria_not_found' };
  }

  return { ok: true, hits: [...byAlias.values()] };
}

function collectAnilistTitleSignals(data: {
  romaji_title?: string;
  title: string;
  japanese_title: string;
  animeInfo?: { Japanese?: string; Synonyms?: string };
}): string[] {
  const bag: string[] = [];
  const push = (raw?: string | null) => {
    const t = raw?.trim();
    if (!t) return;
    bag.push(normalizeComparableTitle(t));
    bag.push(...tokenizeComparable(t));
  };
  push(data.romaji_title);
  push(data.title);
  push(data.japanese_title);
  push(data.animeInfo?.Japanese);
  const syn = data.animeInfo?.Synonyms?.trim();
  if (syn) {
    for (const p of syn.split(',')) {
      push(p.trim());
    }
  }
  return [...new Set(bag.filter(Boolean))];
}

function scoreAnilibriaSearchHit(
  hit: AnilibriaSearchHit,
  data: {
    romaji_title?: string;
    title: string;
    japanese_title: string;
    animeInfo?: { Japanese?: string; Synonyms?: string };
  }
): number {
  const english = hit.name?.english?.trim();
  const alternative = hit.name?.alternative?.trim();
  const main = hit.name?.main?.trim();
  const alias = typeof hit.alias === 'string' ? hit.alias.trim() : '';

  const haystacks: string[] = [];
  if (english) {
    haystacks.push(normalizeComparableTitle(english), ...tokenizeComparable(english));
  }
  if (alternative) {
    haystacks.push(normalizeComparableTitle(alternative), ...tokenizeComparable(alternative));
  }
  if (main) {
    haystacks.push(normalizeComparableTitle(main), ...tokenizeComparable(main));
  }
  if (alias) {
    const readable = alias.replace(/-/g, ' ');
    haystacks.push(normalizeComparableTitle(readable), ...tokenizeComparable(readable));
  }

  const needles = collectAnilistTitleSignals(data).filter((t) => t.length > 1);
  if (!haystacks.length || !needles.length) return 0;

  let best = 0;
  for (const h of haystacks) {
    if (!h) continue;
    for (const n of needles) {
      if (h === n) best = Math.max(best, 120);
      else if (h.includes(n) || n.includes(h)) best = Math.max(best, 72);
    }
  }

  const engNorm = english ? normalizeComparableTitle(english) : '';
  const romajiNorm = data.romaji_title ? normalizeComparableTitle(data.romaji_title) : '';
  const titleNorm = normalizeComparableTitle(data.title);
  if (engNorm && romajiNorm && engNorm === romajiNorm) best += 220;
  if (engNorm && titleNorm && engNorm === titleNorm) best += 200;
  if (engNorm && romajiNorm) {
    best += jaccardTokens(tokenizeComparable(engNorm), tokenizeComparable(romajiNorm)) * 90;
  }

  return best;
}

const MIN_ANILIBRIA_MATCH_SCORE = 32;

function pickBestAnilibriaSearchHit(
  hits: AnilibriaSearchHit[],
  data: {
    romaji_title?: string;
    title: string;
    japanese_title: string;
    animeInfo?: { Japanese?: string; Synonyms?: string };
  }
): AnilibriaSearchHit | null {
  if (!hits.length) return null;
  let best: AnilibriaSearchHit | null = null;
  let bestScore = -1;
  for (const h of hits) {
    const s = scoreAnilibriaSearchHit(h, data);
    if (s > bestScore) {
      bestScore = s;
      best = h;
    }
  }
  if (!best || bestScore < MIN_ANILIBRIA_MATCH_SCORE) return null;
  return best;
}

async function resolveAnilibriaAliasForAnimeData(data: {
  romaji_title?: string;
  title: string;
  japanese_title: string;
  animeInfo?: { Japanese?: string; Synonyms?: string };
}): Promise<{ ok: true; alias: string } | { ok: false; error: string }> {
  const collected = await collectAnilibriaSearchHitsFromAnime(data);
  if (!collected.ok) {
    return { ok: false, error: collected.error };
  }
  const best = pickBestAnilibriaSearchHit(collected.hits, data);
  if (!best) {
    return { ok: false, error: 'anilibria_not_found' };
  }
  const alias = typeof best.alias === 'string' ? best.alias.trim() : '';
  if (!alias) {
    return { ok: false, error: 'anilibria_missing_alias' };
  }
  return { ok: true, alias };
}

export interface AnilibriaWatchBundleOk {
  ok: true;
  alias: string;
  releaseId: number;
  title: string;
  episodes: EpisodesTypes[];
  totalEpisodes: number;
}

export interface AnilibriaWatchBundleErr {
  ok: false;
  error: string;
}

export type AnilibriaWatchBundle = AnilibriaWatchBundleOk | AnilibriaWatchBundleErr;

export interface AnilibriaMatchOk {
  ok: true;
  alias: string;
}

export interface AnilibriaMatchErr {
  ok: false;
  error: string;
}

export type AnilibriaMatch = AnilibriaMatchOk | AnilibriaMatchErr;

async function loadAnilibriaMatchAliasUncached(anilistId: string): Promise<AnilibriaMatch> {
  const idTrim = anilistId.trim();
  if (!/^\d+$/.test(idTrim)) {
    return { ok: false, error: 'invalid_anilist_id' };
  }

  let animeResults: Awaited<ReturnType<typeof getAnimeInfo>>;
  try {
    animeResults = await getAnimeInfo(idTrim);
  } catch {
    return { ok: false, error: 'anilist_fetch_failed' };
  }

  const data = animeResults?.data;
  if (!data) {
    return { ok: false, error: 'no_anilist_data' };
  }

  return resolveAnilibriaAliasForAnimeData(data);
}

const MATCH_CACHE_SECONDS = 5 * 60;

const cachedMatch = unstable_cache(
  async (anilistId: string) => loadAnilibriaMatchAliasUncached(anilistId),
  ['anilibria-match-alias'],
  { revalidate: MATCH_CACHE_SECONDS }
);

export function getCachedAnilibriaMatch(anilistId: string): Promise<AnilibriaMatch> {
  return cachedMatch(anilistId.trim());
}

async function fetchReleaseByAlias(alias: string): Promise<AnilibriaReleaseWithEpisodes | null> {
  const path = `/anime/releases/${encodeURIComponent(alias)}?include=episodes`;
  const { ok, text } = await anilibriaFetchText(path);
  if (!ok) return null;
  try {
    return JSON.parse(text) as AnilibriaReleaseWithEpisodes;
  } catch {
    return null;
  }
}

async function loadAnilibriaWatchBundleUncached(anilistId: string): Promise<AnilibriaWatchBundle> {
  const idTrim = anilistId.trim();
  if (!/^\d+$/.test(idTrim)) {
    return { ok: false, error: 'invalid_anilist_id' };
  }

  let animeResults: Awaited<ReturnType<typeof getAnimeInfo>>;
  try {
    animeResults = await getAnimeInfo(idTrim);
  } catch {
    return { ok: false, error: 'anilist_fetch_failed' };
  }

  const data = animeResults?.data;
  if (!data) {
    return { ok: false, error: 'no_anilist_data' };
  }

  const matched = await resolveAnilibriaAliasForAnimeData(data);
  if (!matched.ok) {
    return { ok: false, error: matched.error };
  }
  const alias = matched.alias;

  const release = await fetchReleaseByAlias(alias);
  const rawEpisodes = release?.episodes;
  if (!Array.isArray(rawEpisodes) || rawEpisodes.length === 0) {
    return { ok: false, error: 'anilibria_no_episodes' };
  }

  const sorted = sortAnilibriaEpisodes(rawEpisodes);
  const episodes = mapAnilibriaEpisodesToList(sorted);
  const releaseId = typeof release?.id === 'number' ? release.id : 0;
  const title =
    release?.name?.english?.trim() ||
    release?.name?.main?.trim() ||
    alias;

  return {
    ok: true,
    alias,
    releaseId,
    title,
    episodes,
    totalEpisodes: episodes.length,
  };
}

const BUNDLE_CACHE_SECONDS = 5 * 60;

const cachedBundle = unstable_cache(
  async (anilistId: string) => loadAnilibriaWatchBundleUncached(anilistId),
  ['anilibria-watch-bundle'],
  { revalidate: BUNDLE_CACHE_SECONDS }
);

export function getCachedAnilibriaWatchBundle(anilistId: string): Promise<AnilibriaWatchBundle> {
  return cachedBundle(anilistId.trim());
}

export interface AnilibriaStreamOk {
  ok: true;
  url: string;
  intro: { start: number; end: number } | null;
  outro: { start: number; end: number } | null;
}

export interface AnilibriaStreamErr {
  ok: false;
  error: string;
}

export type AnilibriaStreamResult = AnilibriaStreamOk | AnilibriaStreamErr;

function pickHlsUrl(ep: AnilibriaEpisodeRaw): string | null {
  const u =
    (typeof ep.hls_1080 === 'string' && ep.hls_1080.trim()) ||
    (typeof ep.hls_720 === 'string' && ep.hls_720.trim()) ||
    (typeof ep.hls_480 === 'string' && ep.hls_480.trim()) ||
    '';
  return u || null;
}

function parseSkip(
  block: { start?: number | null; stop?: number | null } | null | undefined,
  mode: 'intro' | 'outro'
): { start: number; end: number } | null {
  if (!block) return null;
  const start = typeof block.start === 'number' && Number.isFinite(block.start) ? block.start : null;
  const stop = typeof block.stop === 'number' && Number.isFinite(block.stop) ? block.stop : null;
  if (start == null || stop == null || stop <= start) return null;
  if (mode === 'intro') return { start, end: stop };
  /** ending: часто інтервали від кінця — для плеєра залишаємо той самий формат секунд від початку, якщо обидва малі. */
  return { start, end: stop };
}

async function loadAnilibriaStreamUncached(
  alias: string,
  episodeIndex: number
): Promise<AnilibriaStreamResult> {
  const al = alias.trim();
  if (!al || al.length > 200 || /[\u0000-\u001f<>"]/.test(al)) {
    return { ok: false, error: 'invalid_alias' };
  }
  if (!Number.isFinite(episodeIndex) || episodeIndex < 1 || episodeIndex > 2000) {
    return { ok: false, error: 'invalid_episode' };
  }

  const release = await fetchReleaseByAlias(al);
  const rawEpisodes = release?.episodes;
  if (!Array.isArray(rawEpisodes) || rawEpisodes.length === 0) {
    return { ok: false, error: 'anilibria_no_episodes' };
  }

  const sorted = sortAnilibriaEpisodes(rawEpisodes);
  const ep = sorted[episodeIndex - 1];
  if (!ep) {
    return { ok: false, error: 'episode_out_of_range' };
  }

  const url = pickHlsUrl(ep);
  if (!url) {
    return { ok: false, error: 'anilibria_no_hls' };
  }

  return {
    ok: true,
    url,
    intro: parseSkip(ep.opening ?? null, 'intro'),
    outro: parseSkip(ep.ending ?? null, 'outro'),
  };
}

const STREAM_CACHE_SECONDS = 2 * 60;

const cachedStream = unstable_cache(
  async (alias: string, episodeIndex: number) => loadAnilibriaStreamUncached(alias, episodeIndex),
  ['anilibria-stream'],
  { revalidate: STREAM_CACHE_SECONDS }
);

export function getCachedAnilibriaStream(
  alias: string,
  episodeIndex: number
): Promise<AnilibriaStreamResult> {
  return cachedStream(alias.trim(), Math.floor(episodeIndex));
}
