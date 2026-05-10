import { ApiError } from '@/lib/errors/ApiError';
import { animekaiApi } from '@/lib/animekai-api';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';

interface AnimeKaiSearchHit {
  slug?: string;
  title?: string;
  japanese_title?: string;
  type?: string;
  year?: string;
  total_episodes?: string;
  sub_episodes?: string;
  dub_episodes?: string;
}

interface AnimeKaiSearchResponse {
  success?: boolean;
  results?: AnimeKaiSearchHit[];
  error?: string;
}

interface AnimeKaiAnimeResponse {
  success?: boolean;
  ani_id?: string;
  error?: string;
  slug?: string;
  /** З бекенду після парсингу syncData на /watch/{slug}. */
  mal_id?: number | null;
  anilist_id?: number | null;
  title?: string;
  japanese_title?: string;
  type?: string;
  detail?: {
    episodes?: string | number;
    [key: string]: unknown;
  };
}

function normalizeKeyword(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Шлях на **твоєму** AnimeKai-бекенді: JSON як у `GET /api/anime/:slug`
 * (мінімум `ani_id`; `slug` опційно).
 */
export function buildAnimeKaiAnilistResolvePath(anilistId: string): string {
  return `/api/anime/anilist/${encodeURIComponent(anilistId.trim())}`;
}

/** Прямий резолв за AniList id; повертає null якщо ендпоінта немає або тайтл не в каталозі. */
export async function tryResolveAnimeKaiByAnilistId(
  anilistId: string,
  signal?: AbortSignal
): Promise<{ ani_id: string; slug: string } | null> {
  const id = anilistId.trim();
  if (!/^\d+$/.test(id) || id === '0') return null;
  try {
    const detail = await animekaiApi.get<AnimeKaiAnimeResponse>(
      buildAnimeKaiAnilistResolvePath(id),
      undefined,
      signal
    );
    if (detail.success === false) return null;
    if (typeof detail.error === 'string' && detail.error.trim()) return null;
    /**
     * Захист від хибного мапінгу на бекенді: якщо endpoint повернув anilist_id,
     * він має строго збігатися з тим, що ми запитували.
     */
    if (
      detail.anilist_id != null &&
      Number.isFinite(detail.anilist_id) &&
      detail.anilist_id > 0 &&
      String(detail.anilist_id) !== id
    ) {
      return null;
    }
    const ani_id = detail.ani_id?.trim();
    if (!ani_id) return null;
    const slug = detail.slug?.trim();
    return { ani_id, slug: slug && slug.length > 0 ? slug : id };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    return null;
  }
}

export function buildAnimeKaiMalResolvePath(malId: string): string {
  return `/api/anime/mal/${encodeURIComponent(malId.trim())}`;
}

/** Прямий резолв за MAL id (бекенд зіставляє з AniList / AnimeKai). */
export async function tryResolveAnimeKaiByMalId(
  malId: string | number,
  signal?: AbortSignal
): Promise<{ ani_id: string; slug: string } | null> {
  const raw =
    typeof malId === 'number' && Number.isFinite(malId) && malId > 0
      ? String(Math.floor(malId))
      : String(malId).trim();
  if (!/^\d+$/.test(raw) || raw === '0') return null;
  try {
    const detail = await animekaiApi.get<AnimeKaiAnimeResponse>(
      buildAnimeKaiMalResolvePath(raw),
      undefined,
      signal
    );
    if (detail.success === false) return null;
    if (typeof detail.error === 'string' && detail.error.trim()) return null;
    /**
     * Захист від хибного мапінгу на бекенді: якщо endpoint повернув mal_id,
     * він має строго збігатися з тим, що ми запитували.
     */
    if (
      detail.mal_id != null &&
      Number.isFinite(detail.mal_id) &&
      detail.mal_id > 0 &&
      String(detail.mal_id) !== raw
    ) {
      return null;
    }
    const ani_id = detail.ani_id?.trim();
    if (!ani_id) return null;
    const slug = detail.slug?.trim();
    return { ani_id, slug: slug && slug.length > 0 ? slug : `mal-${raw}` };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    return null;
  }
}

/** Підказки з AniList, щоб відрізнити напр. різні частини JoJo в одному пошуку. */
export interface AnimeKaiResolveHints {
  format?: string | null;
  seasonYear?: number | null;
  episodeCount?: number | null;
  anilistId?: number | null;
  malId?: number | null;
}

export function buildAnimeKaiResolveHints(data: AnimeData): AnimeKaiResolveHints {
  const format = data.showType?.trim() || null;
  const prem = data.animeInfo?.Premiered?.trim();
  let seasonYear: number | null = null;
  if (prem && /^\d{4}$/.test(prem)) {
    seasonYear = parseInt(prem, 10);
  }
  const subEp = data.animeInfo?.tvInfo?.episodeTotal?.trim();
  let episodeCount: number | null = null;
  if (subEp && /^\d+$/.test(subEp)) {
    episodeCount = parseInt(subEp, 10);
  }
  const anilistId =
    typeof data.id === 'string' && /^\d+$/.test(data.id.trim())
      ? parseInt(data.id.trim(), 10)
      : null;
  const malId =
    typeof data.mal_id === 'number' && Number.isFinite(data.mal_id) && data.mal_id > 0
      ? Math.floor(data.mal_id)
      : null;
  return { format, seasonYear, episodeCount, anilistId, malId };
}

export function buildAnimeKaiSearchTerms(data: AnimeData): string[] {
  const push = (arr: string[], s: string | undefined | null) => {
    const t = s?.trim();
    if (t && t.length >= 2 && !arr.includes(t)) arr.push(t);
  };
  /** Спочатку native / romaji — у каталозі AnimeKai вони зазвичай збігаються з карткою; англ. локалізація часто розходиться. */
  const primary: string[] = [];
  push(primary, data.animeInfo?.Japanese);
  push(primary, data.romaji_title);
  primary.sort((a, b) => b.length - a.length);

  const secondary: string[] = [];
  push(secondary, data.title);
  push(secondary, data.japanese_title);
  const parts = (data.animeInfo?.Synonyms ?? '').split(',');
  for (const p of parts) push(secondary, p.trim());
  secondary.sort((a, b) => b.length - a.length);

  const out: string[] = [...primary];
  for (const t of secondary) {
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

/**
 * Варіанти одного рядка для `/api/search` — дужки, підзаголовки після `:`, зайва пунктуація.
 */
function expandSearchQueryVariants(raw: string): string[] {
  const t = raw.trim().normalize('NFKC');
  if (t.length < 2) return [];
  const pool: string[] = [];
  const add = (s: string) => {
    const x = s.trim().replace(/\s+/g, ' ');
    if (x.length >= 2 && !pool.includes(x)) pool.push(x);
  };
  add(t);
  const noParen = t
    .replace(/\([^)]{0,400}\)/g, ' ')
    .replace(/（[^）]{0,400}）/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  add(noParen);
  for (const part of noParen.split(/[:\|｜]/)) add(part.trim());
  add(noParen.replace(/[\-_·•]+/g, ' ').replace(/\s+/g, ' ').trim());
  return pool.sort((a, b) => b.length - a.length);
}

function buildExpandedKeywordQueue(baseTerms: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const term of baseTerms) {
    for (const v of expandSearchQueryVariants(term)) {
      const q = v.trim();
      if (q.length < 2 || seen.has(q)) continue;
      seen.add(q);
      out.push(q);
    }
  }
  return out;
}

function normalizeForMatch(s: string): string {
  return s
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeNormalized(s: string): string[] {
  const n = normalizeForMatch(s);
  if (!n) return [];
  return n.split(/\s+/).filter((x) => x.length >= 2);
}

function hasAnyToken(blob: string, tokens: string[]): boolean {
  for (const t of tokens) {
    if (blob.includes(t)) return true;
  }
  return false;
}

function normalizeFormat(f: string): string {
  return f.trim().toUpperCase().replace(/_/g, '');
}

function formatsCompatible(anilist: string, kai: string): boolean {
  const a = normalizeFormat(anilist);
  const k = normalizeFormat(kai);
  if (!a || !k) return false;
  if (a === k) return true;
  if ((a === 'SPECIAL' || a === 'TVSHORT') && k === 'OVA') return true;
  if (a === 'ONA' && k === 'ONA') return true;
  /** AniList і каталоги часто по-різному ставлять ONA vs TV для тих самих коротких/стримінгових серій. */
  if ((a === 'ONA' && k === 'TV') || (a === 'TV' && k === 'ONA')) return true;
  return false;
}

function isSearchHitHardMismatch(
  hit: AnimeKaiSearchHit,
  hints: AnimeKaiResolveHints | undefined
): boolean {
  if (!hints) return false;
  const expectedFormat = normalizeFormat(String(hints.format ?? ''));
  const hitFormat = normalizeFormat(String(hit.type ?? ''));
  if (
    expectedFormat === 'TV' &&
    hitFormat &&
    hitFormat !== 'TV' &&
    hitFormat !== 'ONA'
  ) {
    return true;
  }
  const expectedEpisodes = hints.episodeCount ?? 0;
  if (expectedEpisodes < 100) return false;
  const hitEpisodes = episodeCountFromSearchHit(hit);
  if (hitEpisodes == null || hitEpisodes <= 0) return false;
  const minAccepted = Math.max(24, Math.floor(expectedEpisodes * 0.35));
  return hitEpisodes < minAccepted;
}

function scoreSearchHit(hit: AnimeKaiSearchHit, terms: string[]): number {
  const blob = normalizeForMatch(
    `${hit.title ?? ''} ${hit.japanese_title ?? ''}`
  );
  const blobTokens = new Set(tokenizeNormalized(blob));
  const queryTokens = Array.from(
    new Set(tokenizeNormalized(terms.join(' ')))
  );
  let score = 0;
  const fullQuery = normalizeForMatch(terms.join(' '));
  const fullTitle = normalizeForMatch(hit.title ?? '');
  const fullJapanese = normalizeForMatch(hit.japanese_title ?? '');

  if (fullQuery && (fullQuery === fullTitle || fullQuery === fullJapanese)) {
    score += 14;
  }

  for (const raw of terms) {
    const n = normalizeForMatch(raw);
    if (n.length < 2) continue;
    if (blob === n) score += 6;
    else if (blob.startsWith(n) || n.startsWith(blob)) score += 4;
    else if (blob.includes(n)) score += 3;
    /** Мінімум 8 символів — інакше «nippon» з довгої англ. назви дає +1 стороннім «…Nippon…». */
    else if (n.length >= 8 && blob.includes(n.slice(0, 8))) score += 1;
  }
  /** Кілька значущих слів з англ. назви збігаються з каталогом (різний порядок / скорочення). */
  for (const raw of terms) {
    const n = normalizeForMatch(raw);
    if (n.length < 6) continue;
    const words = n.split(/\s+/).filter((w) => w.length >= 3);
    if (words.length < 2) continue;
    let matched = 0;
    for (const w of words) {
      if (blob.includes(w)) matched++;
    }
    if (matched >= Math.ceil(words.length * 0.5)) {
      score += 2;
      break;
    }
  }

  if (queryTokens.length >= 1) {
    let matched = 0;
    for (const qt of queryTokens) {
      if (blobTokens.has(qt)) matched++;
    }
    const coverage = matched / queryTokens.length;
    if (coverage >= 1) score += 8;
    else if (coverage >= 0.8) score += 5;
    else if (coverage >= 0.6) score += 2;
    else score -= 4;
  }

  const sequelTokens = [
    'shippuden',
    'shippuuden',
    'boruto',
    'next generations',
    'movie',
    'film',
    'gaiden',
    'chronicles',
    'special',
  ];
  const queryBlob = normalizeForMatch(terms.join(' '));
  for (const token of sequelTokens) {
    if (!blob.includes(token)) continue;
    if (queryBlob.includes(token)) continue;
    score -= 10;
  }

  return score;
}

function catalogEpisodeCount(hit: AnimeKaiSearchHit): number {
  const candidates = [hit.total_episodes, hit.sub_episodes, hit.dub_episodes]
    .map((x) => parseInt(String(x ?? '').trim(), 10))
    .filter((x) => Number.isFinite(x) && x > 0);
  return candidates.length ? Math.max(...candidates) : 0;
}

function preferredCatalogPenalty(hit: AnimeKaiSearchHit, terms: string[]): number {
  const queryBlob = normalizeForMatch(terms.join(' '));
  const titleBlob = normalizeForMatch(
    `${hit.title ?? ''} ${hit.japanese_title ?? ''}`
  );
  let penalty = 0;
  const penalizedTokens = [
    'uncropped',
    'uncut',
    'censored',
    'uncensored',
    'remastered',
    'remaster',
    'director s cut',
    'movie',
    'special',
    'ova',
    'ona',
    'fan letter',
    'recap',
  ];
  for (const token of penalizedTokens) {
    if (!titleBlob.includes(token)) continue;
    if (queryBlob.includes(token)) continue;
    penalty -= 6;
  }
  return penalty;
}

function catalogEpisodeBonus(hit: AnimeKaiSearchHit): number {
  const count = catalogEpisodeCount(hit);
  if (count >= 1000) return 9;
  if (count >= 500) return 7;
  if (count >= 200) return 5;
  if (count >= 100) return 3;
  if (count >= 24) return 1;
  return 0;
}

function prefersTvSeries(queryTerms: string[]): boolean {
  const queryBlob = normalizeForMatch(queryTerms.join(' '));
  const explicitNonTvTokens = ['movie', 'special', 'ova', 'ona', 'film'];
  for (const token of explicitNonTvTokens) {
    if (queryBlob.includes(token)) return false;
  }
  return true;
}

function episodeCountFromSearchHit(hit: AnimeKaiSearchHit): number | null {
  const candidates = [hit.total_episodes, hit.sub_episodes, hit.dub_episodes]
    .map((x) => parseInt(String(x ?? '').trim(), 10))
    .filter((x) => Number.isFinite(x) && x > 0);
  if (!candidates.length) return null;
  return Math.max(...candidates);
}

function hintScore(
  hit: AnimeKaiSearchHit,
  hints: AnimeKaiResolveHints | undefined
): number {
  if (!hints) return 0;
  let s = 0;
  const hFormat = hints.format?.trim();
  const hitType = hit.type?.trim();
  if (hFormat && hitType) {
    if (formatsCompatible(hFormat, hitType)) {
      s += 10;
    } else if (normalizeFormat(hFormat) === normalizeFormat(hitType)) {
      s += 8;
    }
  }

  const y = parseInt(String(hit.year ?? '').trim(), 10);
  if (hints.seasonYear != null && Number.isFinite(y) && y > 0) {
    const diff = Math.abs(y - hints.seasonYear);
    if (diff === 0) s += 8;
    else if (diff === 1) s += 4;
    else if (diff <= 2) s += 2;
  }

  const te = parseInt(
    String(hit.total_episodes ?? hit.sub_episodes ?? '').trim(),
    10
  );
  if (hints.episodeCount != null && Number.isFinite(te) && te > 0) {
    if (te === hints.episodeCount) s += 10;
    else if (Math.abs(te - hints.episodeCount) <= 1) s += 6;
    else if (Math.abs(te - hints.episodeCount) <= 3) s += 3;
    /**
     * Для long-running тайтлів (One Piece/Gintama/Naruto) короткий спін-офф
     * часто має дуже схожу назву; сильний штраф за явно меншу кількість епізодів.
     */
    if (hints.episodeCount >= 50) {
      const ratio = te / hints.episodeCount;
      if (ratio < 0.35) s -= 14;
      else if (ratio < 0.5) s -= 10;
      else if (ratio < 0.7) s -= 6;
    }
  }

  return s;
}

function catalogPreferenceScore(hit: AnimeKaiSearchHit, terms: string[]): number {
  let score = catalogEpisodeBonus(hit) + preferredCatalogPenalty(hit, terms);
  if (prefersTvSeries(terms) && normalizeFormat(String(hit.type ?? '')) === 'TV') {
    score += 3;
  }
  return score;
}

function isConfidentMatch(
  titleScore: number,
  hintsScore: number,
  relaxed: boolean
): boolean {
  if (!relaxed) {
    if (titleScore >= 3) return true;
    if (titleScore >= 1 && hintsScore >= 12) return true;
    if (titleScore === 0 && hintsScore >= 18) return true;
    return false;
  }
  if (titleScore >= 2) return true;
  if (titleScore >= 1 && hintsScore >= 8) return true;
  if (titleScore === 0 && hintsScore >= 14) return true;
  return false;
}

function isBetterHit(
  combined: number,
  titleScore: number,
  hintsScore: number,
  index: number,
  bestCombined: number,
  bestTitle: number,
  bestHints: number,
  bestIndex: number
): boolean {
  if (combined > bestCombined) return true;
  if (combined < bestCombined) return false;
  if (titleScore > bestTitle) return true;
  if (titleScore < bestTitle) return false;
  if (hintsScore > bestHints) return true;
  if (hintsScore < bestHints) return false;
  return index < bestIndex;
}

function pickBestSearchHit(
  results: AnimeKaiSearchHit[],
  terms: string[],
  hints?: AnimeKaiResolveHints
): AnimeKaiSearchHit | null {
  const eligible = results.filter((hit) => !isSearchHitHardMismatch(hit, hints));
  if (!eligible.length) return null;
  let bestIdx = 0;
  let bestTitle = scoreSearchHit(eligible[0], terms);
  let bestHints = hintScore(eligible[0], hints);
  let bestCombined = bestTitle + bestHints + catalogPreferenceScore(eligible[0], terms);

  for (let i = 1; i < eligible.length; i++) {
    const t = scoreSearchHit(eligible[i], terms);
    const h = hintScore(eligible[i], hints);
    const p = catalogPreferenceScore(eligible[i], terms);
    const combined = t + h + p;
    if (isBetterHit(combined, t, h, i, bestCombined, bestTitle, bestHints, bestIdx)) {
      bestIdx = i;
      bestTitle = t;
      bestHints = h;
      bestCombined = combined;
    }
  }

  const best = eligible[bestIdx];
  if (isConfidentMatch(bestTitle, bestHints, false)) return best;
  if (isConfidentMatch(bestTitle, bestHints, true)) return best;
  return null;
}

function episodesFromAnimeDetail(
  detail: AnimeKaiAnimeResponse
): number | null {
  const raw = detail.detail?.episodes;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  if (typeof raw === 'string' && raw.trim()) {
    const n = parseInt(raw.trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

/**
 * Після GET /api/anime/:slug — чи детальна картка виглядає як той самий тайтл, що на AniList.
 * Зменшує підміну, коли скор по короткому search ок, а повна картка — ні.
 */
function detailMatchesAnilistExpectation(
  detail: AnimeKaiAnimeResponse,
  searchHit: AnimeKaiSearchHit,
  terms: string[],
  hints?: AnimeKaiResolveHints
): boolean {
  if (
    hints?.anilistId != null &&
    detail.anilist_id != null &&
    Number.isFinite(detail.anilist_id) &&
    detail.anilist_id > 0 &&
    detail.anilist_id !== hints.anilistId
  ) {
    return false;
  }
  if (
    hints?.malId != null &&
    detail.mal_id != null &&
    Number.isFinite(detail.mal_id) &&
    detail.mal_id > 0 &&
    detail.mal_id !== hints.malId
  ) {
    return false;
  }

  const mergedHit: AnimeKaiSearchHit = {
    ...searchHit,
    title: detail.title?.trim() || searchHit.title,
    japanese_title:
      detail.japanese_title?.trim() || searchHit.japanese_title,
    type: detail.type?.trim() || searchHit.type,
  };
  const t = scoreSearchHit(mergedHit, terms);
  const h = hintScore(mergedHit, hints);
  if (
    hints?.anilistId != null &&
    detail.anilist_id != null &&
    Number.isFinite(detail.anilist_id) &&
    detail.anilist_id === hints.anilistId
  ) {
    return true;
  }
  if (
    hints?.malId != null &&
    detail.mal_id != null &&
    Number.isFinite(detail.mal_id) &&
    detail.mal_id === hints.malId
  ) {
    return true;
  }
  if (t >= 3) return true;
  if (t >= 1 && h >= 10) return true;

  const de = episodesFromAnimeDetail(detail);
  if (
    de != null &&
    hints?.episodeCount != null &&
    hints.episodeCount >= 50 &&
    de < Math.max(20, Math.floor(hints.episodeCount * 0.6))
  ) {
    return false;
  }
  if (
    de != null &&
    hints?.episodeCount != null &&
    (de === hints.episodeCount || Math.abs(de - hints.episodeCount) <= 1) &&
    t >= 2
  ) {
    return true;
  }
  return false;
}

/** Кандидати з одного search, від кращого скору до гіршого (обмежено detail-запитами). */
function orderSearchHitsByScore(
  results: AnimeKaiSearchHit[],
  terms: string[],
  hints?: AnimeKaiResolveHints
): AnimeKaiSearchHit[] {
  return [...results]
    .filter((hit) => !isSearchHitHardMismatch(hit, hints))
    .map((hit, index) => ({
      hit,
      index,
      score:
        scoreSearchHit(hit, terms) +
        hintScore(hit, hints) +
        catalogPreferenceScore(hit, terms),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    })
    .map((x) => x.hit);
}

const MAX_ANIME_DETAIL_TRIES_PER_KEYWORD = 8;

/**
 * Резолвить AnimeKai ani_id за списком пошукових рядків (з AniList-картки).
 * `hints` зменшує плутанину для однакових назв (різні сезони / частини).
 */
export async function resolveAnimeKaiAniId(
  searchTerms: string[],
  signal?: AbortSignal,
  hints?: AnimeKaiResolveHints
): Promise<{ ani_id: string; slug: string }> {
  const terms = searchTerms.filter((t) => t.trim().length >= 2);
  if (!terms.length) {
    throw new ApiError('AnimeKai: немає назви для пошуку', 400);
  }

  const keywords = buildExpandedKeywordQueue(terms);
  const tried = new Set<string>();

  for (const keyword of keywords) {
    const q = normalizeKeyword(keyword);
    if (q.length < 2 || tried.has(q)) continue;
    tried.add(q);

    const searchQuery = new URLSearchParams();
    searchQuery.set('keyword', q);
    const data = await animekaiApi.get<AnimeKaiSearchResponse>(
      `/api/search?${searchQuery.toString()}`,
      undefined,
      signal
    );

    if (typeof data.error === 'string' && data.error.trim()) {
      continue;
    }

    const results = Array.isArray(data.results) ? data.results : [];
    if (pickBestSearchHit(results, terms, hints) == null) continue;

    const ordered = orderSearchHitsByScore(results, terms, hints);
    let triedDetail = 0;

    for (const hit of ordered) {
      if (triedDetail >= MAX_ANIME_DETAIL_TRIES_PER_KEYWORD) break;
      const slug = hit.slug?.trim();
      if (!slug) continue;

      const t0 = scoreSearchHit(hit, terms);
      const h0 = hintScore(hit, hints);
      if (!isConfidentMatch(t0, h0, true)) continue;

      triedDetail++;
      let detail: AnimeKaiAnimeResponse;
      try {
        detail = await animekaiApi.get<AnimeKaiAnimeResponse>(
          `/api/anime/${encodeURIComponent(slug)}`,
          undefined,
          signal
        );
      } catch {
        continue;
      }

      if (typeof detail.error === 'string' && detail.error.trim()) {
        continue;
      }

      const ani_id = detail.ani_id?.trim();
      if (!ani_id) continue;

      if (!detailMatchesAnilistExpectation(detail, hit, terms, hints)) {
        continue;
      }

      return { ani_id, slug };
    }
  }

  throw new ApiError(
    'AnimeKai: не знайдено відповідного тайтлу в каталозі (спробуйте іншу назву або перевірте написання).',
    404
  );
}

/**
 * Оцінка "очікуваної" кількості епізодів із каталогу AnimeKai (/api/search),
 * щоб виявляти застарілий кеш мапінгу (коли cache вказує на short/alt запис).
 */
export async function estimateAnimeKaiCatalogEpisodeCount(
  searchTerms: string[],
  signal?: AbortSignal,
  hints?: AnimeKaiResolveHints
): Promise<number | null> {
  const terms = searchTerms.filter((t) => t.trim().length >= 2);
  if (!terms.length) return null;
  const keywords = buildExpandedKeywordQueue(terms).slice(0, 4);
  for (const keyword of keywords) {
    const q = normalizeKeyword(keyword);
    if (q.length < 2) continue;
    const searchQuery = new URLSearchParams();
    searchQuery.set('keyword', q);
    let data: AnimeKaiSearchResponse;
    try {
      data = await animekaiApi.get<AnimeKaiSearchResponse>(
        `/api/search?${searchQuery.toString()}`,
        undefined,
        signal
      );
    } catch {
      continue;
    }
    const results = Array.isArray(data.results) ? data.results : [];
    const best = pickBestSearchHit(results, terms, hints);
    if (!best) continue;
    const count = episodeCountFromSearchHit(best);
    if (count != null && count > 0) return count;
  }
  return null;
}
