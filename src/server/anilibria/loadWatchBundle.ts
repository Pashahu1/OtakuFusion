import 'server-only';

import { unstable_cache } from 'next/cache';
import { getAnimeInfo } from '@/services/getAnimeInfo';
import {
  mapAnilibriaEpisodesToList,
  sortAnilibriaEpisodes,
  type AnilibriaEpisodeRaw,
} from '@/services/anilibria/episodeMapping';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { anilibriaFetchText } from './http';

const ANILIBRIA_SEARCH_INCLUDE = 'id,alias,name,year,type,episodes_total';

/** Рідкісні жанри дають додаткові «голки» для скорингу; загальні — лише шум. */
const ANILIST_GENRE_STOP = new Set(
  [
    'action',
    'adventure',
    'comedy',
    'drama',
    'fantasy',
    'sci-fi',
    'sci fi',
    'romance',
    'slice of life',
    'supernatural',
    'thriller',
    'mystery',
    'horror',
    'mecha',
    'sports',
    'music',
    'psychological',
    'school',
    'shounen',
    'shoujo',
    'seinen',
    'josei',
    'kids',
    'ecchi',
    'harem',
    'martial arts',
    'military',
    'parody',
    'samurai',
    'super power',
    'vampire',
    'demons',
  ].map((s) => s.toLowerCase())
);

let anilibriaAliasOverrideCache: Map<string, string> | null = null;

function readAnilibriaAnilistAliasOverrides(): Map<string, string> {
  if (anilibriaAliasOverrideCache) return anilibriaAliasOverrideCache;
  const raw = process.env.ANILIBRIA_ANILIST_ALIAS_JSON?.trim();
  if (!raw) {
    anilibriaAliasOverrideCache = new Map();
    return anilibriaAliasOverrideCache;
  }
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    const m = new Map<string, string>();
    for (const [k, v] of Object.entries(o)) {
      const id = String(k).trim();
      const alias = typeof v === 'string' ? v.trim() : '';
      if (/^\d+$/.test(id) && alias) m.set(id, alias);
    }
    anilibriaAliasOverrideCache = m;
    return m;
  } catch {
    anilibriaAliasOverrideCache = new Map();
    return anilibriaAliasOverrideCache;
  }
}

function getManualAnilibriaAliasForAnilistId(anilistId: string): string | null {
  return readAnilibriaAnilistAliasOverrides().get(anilistId.trim()) ?? null;
}

interface AnilibriaSearchHit {
  id?: number;
  alias?: string;
  name?: { main?: string | null; english?: string | null; alternative?: string | null };
  year?: number;
  type?: { value?: string | null; description?: string | null };
  episodes_total?: number | null;
}

interface AnilibriaReleaseWithEpisodes {
  id?: number;
  alias?: string;
  name?: { main?: string | null; english?: string | null; alternative?: string | null };
  year?: number;
  type?: { value?: string | null; description?: string | null };
  episodes_total?: number | null;
  episodes?: AnilibriaEpisodeRaw[];
}

/** Повний реліз для пост-скорингу (ті самі поля, що й у пошуковому хіті, де це можливо). */
function searchHitFromRelease(
  release: AnilibriaReleaseWithEpisodes,
  alias: string,
  playableEpisodeCount: number
): AnilibriaSearchHit {
  return {
    id: release.id,
    alias,
    name: release.name,
    year: typeof release.year === 'number' && Number.isFinite(release.year) ? release.year : undefined,
    type: release.type,
    episodes_total: playableEpisodeCount,
  };
}

/**
 * Пост-перевірка після пошуку: повний реліз + той самий скоринг, що й для хітів.
 * Поріг трохи вищий за пошуковий (32), але нижче за попередню версію — для нових/коротких
 * тайтлів AniList часто дає неповні епізоди/рік, і занадто жорсткий бал ховав валідний Libria.
 * Додаткове правило лише для явного розриву «дуже довгий серіал на AniList vs мало епізодів на Libria».
 */
const MIN_ANILIBRIA_POST_RELEASE_SCORE = 38;
const MIN_ANILIBRIA_LONG_CATALOG_MATCH_SCORE = 68;

function strictReleaseAcceptsAnilist(
  data: AnimeData,
  release: AnilibriaReleaseWithEpisodes,
  alias: string
): boolean {
  const raw = release.episodes;
  if (!Array.isArray(raw) || raw.length === 0) return false;
  const libCount = sortAnilibriaEpisodes(raw).length;
  if (libCount < 1) return false;

  const hit = searchHitFromRelease(release, alias, libCount);
  if (shouldDropAnilibriaHit(data, hit)) return false;
  if (shouldRejectSnkBahamutCollateral(data, hit)) return false;
  if (shouldRejectNarutoOriginalWrongEdition(data, hit)) return false;

  const s = scoreAnilibriaSearchHit(hit, data);
  if (s < MIN_ANILIBRIA_POST_RELEASE_SCORE) return false;

  const expected = parseAnilistEpisodeTotalHint(data);
  if (expected != null && expected >= 96 && libCount > 0 && libCount <= 40) {
    if (libCount * 3 < expected && s < MIN_ANILIBRIA_LONG_CATALOG_MATCH_SCORE) return false;
  }

  return true;
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

function normalizeAnilibriaFormat(value: string | null | undefined): string {
  const v = (value ?? '').trim().toUpperCase();
  if (v === 'TV_SHORT' || v === 'TV_SHORTS') return 'TV';
  return v || 'TV';
}

function parseAnilistEpisodeTotalHint(data: AnimeData): number | null {
  const raw = data.animeInfo?.tvInfo?.episodeTotal?.trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

/**
 * Відсікаємо очевидні промахи: ТВ-серіал (багато еп.) vs фільм, chibi/spin-off для довгих ТВ.
 * Прямого AniList-id у публічному пошуку AniLiberty немає — орієнтуємось на тип і метадані.
 */
function shouldDropAnilibriaHit(data: AnimeData, hit: AnilibriaSearchHit): boolean {
  const aniFmt = normalizeAnilibriaFormat(data.showType);
  const libFmt = normalizeAnilibriaFormat(hit.type?.value);
  const epsHint = parseAnilistEpisodeTotalHint(data);
  const alias = (hit.alias ?? '').toLowerCase();
  const libEp =
    typeof hit.episodes_total === 'number' && Number.isFinite(hit.episodes_total)
      ? hit.episodes_total
      : null;

  if (aniFmt === 'TV' && libFmt === 'MOVIE' && epsHint != null && epsHint >= 3) {
    return true;
  }
  if (aniFmt === 'TV' && libFmt === 'MOVIE' && epsHint != null && epsHint >= 2) {
    if (alias.includes('netflix') || alias.includes('live-action')) return true;
  }
  if (aniFmt === 'TV' && libFmt === 'TV' && epsHint != null && epsHint >= 10) {
    const spinoff = [
      'chuugakkou',
      'chugakkou',
      'chibi',
      'puchi',
      'petit',
      'junior-high',
      'middle-school',
      'gakuen',
      'spin-off',
      'sp-off',
      '-sd',
      'chimi',
    ];
    if (spinoff.some((p) => alias.includes(p))) return true;
  }
  if (aniFmt === 'TV' && libFmt === 'TV' && epsHint != null && epsHint >= 20 && libEp != null && libEp <= 3) {
    if (!alias.includes('recap') && !alias.includes('summary')) return true;
  }
  return false;
}

/** Для перевірок «чи це той самий франшизний тайтл», а не Shingeki no Bahamut тощо. */
function combinedHitHaystack(hit: AnilibriaSearchHit): string {
  const parts = [hit.alias, hit.name?.english, hit.name?.main, hit.name?.alternative];
  return normalizeComparableTitle(parts.filter(Boolean).join(' '));
}

function isAttackOnTitanFamilyByAnilist(data: AnimeData): boolean {
  const romaji = normalizeComparableTitle(data.romaji_title || '');
  if (romaji.includes('kyojin')) return true;
  const eng = normalizeComparableTitle(data.title);
  return eng.includes('attack') && eng.includes('titan');
}

/**
 * Пошук AniLiberty за «Shingeki no Kyojin» часто повертає лише Bahamut / спін-офи.
 * Вимагаємо маркер основного IP (кирилиця «титан», romaji kyojin, attack/titan…).
 */
function shouldRejectSnkBahamutCollateral(data: AnimeData, hit: AnilibriaSearchHit): boolean {
  if (!isAttackOnTitanFamilyByAnilist(data)) return false;
  const h = combinedHitHaystack(hit);
  if (h.includes('kyojin')) return false;
  if (h.includes('titan') || h.includes('titans')) return false;
  if (h.includes('attack')) return false;
  if (h.includes('giant') || h.includes('giants')) return false;
  if (h.includes('титан') || h.includes('атака')) return false;
  return true;
}

function isLikelyNarutoOriginalSeries(data: AnimeData): boolean {
  const hint = parseAnilistEpisodeTotalHint(data);
  if (hint == null || hint < 180 || hint > 280) return false;
  const romaji = (data.romaji_title || '').toLowerCase();
  if (romaji.includes('shippu')) return false;
  if (normalizeComparableTitle(data.title) !== 'naruto') return false;
  return true;
}

function shouldRejectNarutoOriginalWrongEdition(data: AnimeData, hit: AnilibriaSearchHit): boolean {
  if (!isLikelyNarutoOriginalSeries(data)) return false;
  const h = combinedHitHaystack(hit);
  return (
    h.includes('shippuuden') ||
    h.includes('shippuden') ||
    h.includes('boruto') ||
    h.includes('uragannye') ||
    h.includes('疾風')
  );
}

function formatAndEpisodeScore(data: AnimeData, hit: AnilibriaSearchHit): number {
  let score = 0;
  const aniFmt = normalizeAnilibriaFormat(data.showType);
  const libFmt = normalizeAnilibriaFormat(hit.type?.value);
  if (aniFmt === libFmt) score += 260;
  else {
    const movieLike = new Set(['MOVIE']);
    const aniM = movieLike.has(aniFmt);
    const libM = movieLike.has(libFmt);
    if (aniM !== libM) score -= 380;
  }

  const want = parseAnilistEpisodeTotalHint(data);
  const got =
    typeof hit.episodes_total === 'number' && Number.isFinite(hit.episodes_total)
      ? hit.episodes_total
      : null;
  if (want != null && got != null) {
    const diff = Math.abs(want - got);
    if (diff === 0) score += 220;
    else if (want >= 10 && got <= 2) score -= 320;
    else if (want <= 3 && got >= 12) score -= 160;
    else if (diff <= 1) score += 140;
    else if (diff <= Math.max(3, Math.ceil(want * 0.12))) score += 90;
    else score -= Math.min(180, diff * 5);
  }

  return score;
}

function yearSoftBonus(data: AnimeData, hit: AnilibriaSearchHit): number {
  const py = data.animeInfo?.Premiered?.trim();
  if (!py || typeof hit.year !== 'number') return 0;
  const want = Number(py);
  if (!Number.isFinite(want)) return 0;
  const d = Math.abs(want - hit.year);
  if (d === 0) return 45;
  if (d <= 1) return 28;
  if (d <= 2) return 12;
  return 0;
}

/** Кілька рядків пошуку: romaji + англ. + native + синоніми — перший результат AniLiberty часто не той реліз. */
function buildAnilistSearchQueries(data: AnimeData): string[] {
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
  /** «Attack on Titan» дає хибні збіги (напр. «…2nd attack» у російській назві). */
  const titleNorm = normalizeComparableTitle(data.title);
  if (!(titleNorm.includes('attack') && titleNorm.includes('titan'))) {
    push(data.title);
  }
  push(data.japanese_title);
  push(data.animeInfo?.Japanese);

  const syn = data.animeInfo?.Synonyms?.trim();
  if (syn) {
    const parts = syn
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length >= 2 && p.length <= 160);
    for (const p of parts.slice(0, 14)) {
      push(p);
    }
  }

  const slug = normalizeComparableTitle(data.romaji_title || data.title)
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length >= 6 && slug.includes('-')) {
    push(slug);
  }

  return out.slice(0, 14);
}

async function collectAnilibriaSearchHitsFromAnime(
  data: AnimeData
): Promise<
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
      include: ANILIBRIA_SEARCH_INCLUDE,
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

  const merged = [...byAlias.values()];
  const hits = merged.filter(
    (h) =>
      !shouldDropAnilibriaHit(data, h) &&
      !shouldRejectSnkBahamutCollateral(data, h) &&
      !shouldRejectNarutoOriginalWrongEdition(data, h)
  );
  if (!hits.length) {
    return { ok: false, error: 'anilibria_not_found' };
  }

  return { ok: true, hits };
}

function collectAnilistTitleSignals(data: AnimeData): string[] {
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
  const genres = data.animeInfo?.Genres;
  if (Array.isArray(genres)) {
    for (const g of genres) {
      const raw = typeof g === 'string' ? g.trim() : '';
      if (raw.length < 4) continue;
      const gn = normalizeComparableTitle(raw);
      if (ANILIST_GENRE_STOP.has(gn)) continue;
      push(raw);
    }
  }
  return [...new Set(bag.filter(Boolean))];
}

function extraneousEnglishTokenPenalty(hit: AnilibriaSearchHit, data: AnimeData): number {
  const english = hit.name?.english?.trim();
  if (!english) return 0;
  const hitTok = tokenizeComparable(english).filter((t) => t.length > 3);
  const needleTok = new Set(
    collectAnilistTitleSignals(data).filter((t) => t.length > 3)
  );
  if (!hitTok.length || !needleTok.size) return 0;
  let extra = 0;
  for (const t of hitTok) {
    if (needleTok.has(t)) continue;
    const partial = [...needleTok].some((n) => n.includes(t) || t.includes(n));
    if (!partial) extra += 1;
  }
  return -extra * 52;
}

function aliasDistractorPenalty(hit: AnilibriaSearchHit, data: AnimeData): number {
  const alias = (hit.alias ?? '').toLowerCase();
  if (!alias) return 0;
  const aniFmt = normalizeAnilibriaFormat(data.showType);
  const epsHint = parseAnilistEpisodeTotalHint(data);
  let pen = 0;
  if (aniFmt === 'TV' && epsHint != null && epsHint >= 6) {
    if (alias.includes('netflix')) pen -= 220;
    if (alias.includes('live-action')) pen -= 220;
  }
  return pen;
}

function scoreAnilibriaSearchHit(hit: AnilibriaSearchHit, data: AnimeData): number {
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

  return (
    best +
    formatAndEpisodeScore(data, hit) +
    yearSoftBonus(data, hit) +
    extraneousEnglishTokenPenalty(hit, data) +
    aliasDistractorPenalty(hit, data)
  );
}

const MIN_ANILIBRIA_MATCH_SCORE = 32;

function pickBestAnilibriaSearchHit(hits: AnilibriaSearchHit[], data: AnimeData): AnilibriaSearchHit | null {
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

type AnilibriaResolveOk = { ok: true; alias: string; release: AnilibriaReleaseWithEpisodes };
type AnilibriaResolveErr = { ok: false; error: string };
type AnilibriaResolveResult = AnilibriaResolveOk | AnilibriaResolveErr;

async function resolveAnilibriaAliasForAnimeData(data: AnimeData): Promise<AnilibriaResolveResult> {
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

  const release = await fetchReleaseByAlias(alias);
  if (!release) {
    return { ok: false, error: 'anilibria_release_unavailable' };
  }
  if (!strictReleaseAcceptsAnilist(data, release, alias)) {
    return { ok: false, error: 'anilibria_match_rejected' };
  }

  return { ok: true, alias, release };
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

  const manualAlias = getManualAnilibriaAliasForAnilistId(idTrim);
  if (manualAlias) {
    return { ok: true, alias: manualAlias };
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

  const resolved = await resolveAnilibriaAliasForAnimeData(data);
  if (!resolved.ok) return resolved;
  return { ok: true, alias: resolved.alias };
}

const MATCH_CACHE_SECONDS = 5 * 60;

const cachedMatch = unstable_cache(
  async (anilistId: string) => loadAnilibriaMatchAliasUncached(anilistId),
  ['anilibria-match-alias', 'v7-post-release-relaxed'],
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

async function finalizeAnilibriaWatchBundle(
  alias: string,
  prefetchedRelease: AnilibriaReleaseWithEpisodes | null = null
): Promise<AnilibriaWatchBundle> {
  const release = prefetchedRelease ?? (await fetchReleaseByAlias(alias));
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

async function loadAnilibriaWatchBundleUncached(anilistId: string): Promise<AnilibriaWatchBundle> {
  const idTrim = anilistId.trim();
  if (!/^\d+$/.test(idTrim)) {
    return { ok: false, error: 'invalid_anilist_id' };
  }

  const manualAlias = getManualAnilibriaAliasForAnilistId(idTrim);
  if (manualAlias) {
    return finalizeAnilibriaWatchBundle(manualAlias);
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
  return finalizeAnilibriaWatchBundle(matched.alias, matched.release);
}

const BUNDLE_CACHE_SECONDS = 5 * 60;

const cachedBundle = unstable_cache(
  async (anilistId: string) => loadAnilibriaWatchBundleUncached(anilistId),
  ['anilibria-watch-bundle', 'v7-post-release-relaxed'],
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
