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

function safeSearchQueryFromAnime(data: {
  romaji_title?: string;
  title: string;
  japanese_title: string;
}): string {
  const romaji = data.romaji_title?.trim();
  if (romaji) return romaji.slice(0, 200);
  const t = data.title?.trim();
  if (t) return t.slice(0, 200);
  return data.japanese_title?.trim().slice(0, 200) || '';
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

  const query = safeSearchQueryFromAnime(data);
  if (!query) {
    return { ok: false, error: 'no_search_query' };
  }

  const searchParams = new URLSearchParams({
    query,
    include: 'id,alias,name',
  });
  const searchRes = await anilibriaFetchText(`/app/search/releases?${searchParams.toString()}`);
  if (!searchRes.ok) {
    return { ok: false, error: `anilibria_search_${searchRes.status}` };
  }

  let searchList: unknown;
  try {
    searchList = JSON.parse(searchRes.text) as unknown;
  } catch {
    return { ok: false, error: 'anilibria_search_invalid_json' };
  }

  if (!Array.isArray(searchList) || searchList.length === 0) {
    return { ok: false, error: 'anilibria_not_found' };
  }

  const first = searchList[0] as AnilibriaSearchHit;
  const alias = typeof first.alias === 'string' ? first.alias.trim() : '';
  if (!alias) {
    return { ok: false, error: 'anilibria_missing_alias' };
  }

  return { ok: true, alias };
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

  const query = safeSearchQueryFromAnime(data);
  if (!query) {
    return { ok: false, error: 'no_search_query' };
  }

  const searchParams = new URLSearchParams({
    query,
    include: 'id,alias,name',
  });
  const searchRes = await anilibriaFetchText(`/app/search/releases?${searchParams.toString()}`);
  if (!searchRes.ok) {
    return { ok: false, error: `anilibria_search_${searchRes.status}` };
  }

  let searchList: unknown;
  try {
    searchList = JSON.parse(searchRes.text) as unknown;
  } catch {
    return { ok: false, error: 'anilibria_search_invalid_json' };
  }

  if (!Array.isArray(searchList) || searchList.length === 0) {
    return { ok: false, error: 'anilibria_not_found' };
  }

  const first = searchList[0] as AnilibriaSearchHit;
  const alias = typeof first.alias === 'string' ? first.alias.trim() : '';
  if (!alias) {
    return { ok: false, error: 'anilibria_missing_alias' };
  }

  const release = await fetchReleaseByAlias(alias);
  const rawEpisodes = release?.episodes;
  if (!Array.isArray(rawEpisodes) || rawEpisodes.length === 0) {
    return { ok: false, error: 'anilibria_no_episodes' };
  }

  const sorted = sortAnilibriaEpisodes(rawEpisodes);
  const episodes = mapAnilibriaEpisodesToList(sorted);
  const releaseId = typeof release?.id === 'number' ? release.id : typeof first.id === 'number' ? first.id : 0;
  const title =
    release?.name?.english?.trim() ||
    release?.name?.main?.trim() ||
    first.name?.english?.trim() ||
    first.name?.main?.trim() ||
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
