/** Поля AniList для ранжування пошуку (як на картці + метрики). */
export interface AnimeSearchRankMedia {
  id: number;
  title?: {
    english?: string | null;
    romaji?: string | null;
    native?: string | null;
  } | null;
  synonyms?: string[] | null;
  averageScore?: number | null;
  popularity?: number | null;
  favourites?: number | null;
}

const SHORT_LATIN_MAX_LEN = 6;
const MIN_RELEVANCE_SCORE = 260;

const FIELD_WEIGHT = {
  display: 1,
  synonym: 0.88,
  romaji: 0.52,
  native: 0.48,
} as const;

type TitleField = keyof typeof FIELD_WEIGHT;

export function normalizeAnimeSearchQuery(raw: string): string {
  return raw.trim().normalize('NFKC').replace(/\s+/g, ' ');
}

function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/\s+/g, ' ');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function isCjkSearchQuery(queryNorm: string): boolean {
  return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(queryNorm);
}

/** Та сама логіка, що `pickTitle` на картці. */
export function getAnimeDisplayTitle(media: AnimeSearchRankMedia): string {
  const t = media.title;
  return t?.english?.trim() || t?.romaji?.trim() || t?.native?.trim() || '';
}

function scoreTitleField(
  raw: string,
  queryNorm: string,
  field: TitleField,
  opts: { isShortLatin: boolean; isCjk: boolean }
): number {
  const haystack = normalizeSearchText(raw);
  if (!haystack || !queryNorm) return 0;

  const weight = FIELD_WEIGHT[field];
  const qLen = queryNorm.length;
  const wordStart = new RegExp(`(?:^|[\\s:–—-])${escapeRegExp(queryNorm)}`, 'i');

  let base = 0;

  if (haystack === queryNorm) base = 1000;
  else if (haystack.startsWith(queryNorm)) {
    base = 880 - Math.min(haystack.length - qLen, 100);
  } else if (wordStart.test(raw)) {
    const idx = haystack.indexOf(queryNorm);
    const endsWithQuery =
      idx >= 0 && idx + queryNorm.length >= haystack.length - 1;
    const startsNearBeginning = idx >= 0 && idx <= 2;
    if (opts.isShortLatin && endsWithQuery && !startsNearBeginning && field !== 'display') {
      base = 120;
    } else {
      base = 620;
    }
  } else if (haystack.includes(queryNorm)) {
    const looseOnly =
      !haystack.startsWith(queryNorm) && !wordStart.test(raw);
    if (looseOnly && opts.isShortLatin && field !== 'display') {
      base = 70;
    } else if (looseOnly && opts.isShortLatin && field === 'display') {
      base = 380;
    } else {
      base = haystack.length > qLen * 12 ? 180 : 340;
    }
  }

  if (base === 0) return 0;
  return Math.round(base * weight);
}

function popularityBoost(media: AnimeSearchRankMedia): number {
  const pop = media.popularity ?? 0;
  const fav = media.favourites ?? 0;
  const score = media.averageScore ?? 0;
  const popPart = pop > 0 ? Math.log10(pop + 1) * 28 : 0;
  const favPart = fav > 0 ? Math.log10(fav + 1) * 18 : 0;
  const scorePart = score > 0 ? score * 0.35 : 0;
  return popPart + favPart + scorePart;
}

export function scoreAnimeSearchMedia(
  media: AnimeSearchRankMedia,
  query: string
): number {
  const queryNorm = normalizeSearchText(normalizeAnimeSearchQuery(query));
  if (!queryNorm) return 0;

  const isCjk = isCjkSearchQuery(queryNorm);
  const isShortLatin = !isCjk && queryNorm.length <= SHORT_LATIN_MAX_LEN;
  const opts = { isShortLatin, isCjk };

  let best = 0;
  const display = getAnimeDisplayTitle(media);
  if (display) best = Math.max(best, scoreTitleField(display, queryNorm, 'display', opts));

  const romaji = media.title?.romaji?.trim();
  if (romaji && normalizeSearchText(romaji) !== normalizeSearchText(display)) {
    best = Math.max(best, scoreTitleField(romaji, queryNorm, 'romaji', opts));
  }

  const native = media.title?.native?.trim();
  if (native && (isCjk || normalizeSearchText(native).includes(queryNorm))) {
    best = Math.max(best, scoreTitleField(native, queryNorm, 'native', opts));
  }

  for (const syn of media.synonyms ?? []) {
    const s = syn?.trim();
    if (!s) continue;
    best = Math.max(best, scoreTitleField(s, queryNorm, 'synonym', opts));
  }

  return best + popularityBoost(media);
}

export function filterAnimeSearchResults<T extends AnimeSearchRankMedia>(
  ranked: T[],
  query: string
): T[] {
  const queryNorm = normalizeSearchText(normalizeAnimeSearchQuery(query));
  if (!queryNorm) return ranked;

  const isCjk = isCjkSearchQuery(queryNorm);
  const isShortLatin = !isCjk && queryNorm.length <= SHORT_LATIN_MAX_LEN;
  if (!isShortLatin) return ranked;

  return ranked.filter((item) => scoreAnimeSearchMedia(item, query) >= MIN_RELEVANCE_SCORE);
}

export function rankAnimeSearchMedia<T extends AnimeSearchRankMedia>(
  media: T[],
  query: string
): T[] {
  const queryNorm = normalizeSearchText(normalizeAnimeSearchQuery(query));
  if (!queryNorm || media.length === 0) return media;

  const scored = media
    .map((item) => ({ item, score: scoreAnimeSearchMedia(item, query) }))
    .sort((a, b) => b.score - a.score);

  const seen = new Set<number>();
  const deduped: T[] = [];
  for (const row of scored) {
    if (seen.has(row.item.id)) continue;
    seen.add(row.item.id);
    deduped.push(row.item);
  }
  return deduped;
}
