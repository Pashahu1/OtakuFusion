import type { CatalogHints } from '@/lib/catalog/catalog-hints';
import type { HikkaAnimeRow } from '@/lib/catalog/providers/hikka/hikkaAnimeRow';

export type CatalogFormatGroup = 'tv' | 'movie' | 'ova' | 'ona' | 'special';

const DISCRIMINANT_PATTERNS: Array<{ id: string; re: RegExp }> = [
  { id: 'tybw-calamity', re: /calamity|kashin[ -]?tan/i },
  { id: 'tybw-conflict', re: /conflict|soukoku[ -]?tan/i },
  { id: 'tybw-separation', re: /separation|ketsubetsu[ -]?tan/i },
  { id: 'tybw', re: /thousand[- ]year|sennen kessen|tybw/i },
  { id: 'sbr', re: /steel ball/i },
  { id: 'golden-wind', re: /golden wind|vento aureo|ougon no kaze/i },
  { id: 'stone-ocean', re: /stone ocean/i },
  { id: 'stardust-egypt', re: /battle in egypt/i },
  { id: 'stardust', re: /stardust crusaders/i },
  { id: 'diamond', re: /diamond (is |wa )?unbreakable|kudakenai/i },
];

export function normalizeCatalogFormat(
  raw?: string | null,
): CatalogFormatGroup | null {
  const t = raw?.trim().toLowerCase().replace(/[\s_]+/g, '') ?? '';
  if (!t) return null;
  if (t === 'tv' || t === 'tvshort') return 'tv';
  if (t === 'movie' || t === 'film') return 'movie';
  if (t === 'ona') return 'ona';
  if (t === 'ova') return 'ova';
  if (t === 'special' || t === 'tvspecial') return 'special';
  return null;
}

export function formatsAreCompatible(
  left?: string | null,
  right?: string | null,
): boolean {
  const a = normalizeCatalogFormat(left);
  const b = normalizeCatalogFormat(right);
  if (!a || !b) return true;
  if (a === b) return true;
  if ((a === 'ova' && b === 'special') || (a === 'special' && b === 'ova')) {
    return true;
  }
  if ((a === 'tv' && b === 'ona') || (a === 'ona' && b === 'tv')) return true;
  return false;
}

export function hikkaRowHaystack(row: HikkaAnimeRow): string {
  return [
    row.title_en,
    row.title_ja,
    row.title_ua,
    row.title_native,
    row.slug?.replace(/-[a-f0-9]{6}$/i, '').replace(/-/g, ' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function catalogTitleBlob(terms: string[]): string {
  return terms.join(' ').toLowerCase();
}

export function matchingDiscriminantIds(text: string): string[] {
  const ids: string[] = [];
  for (const item of DISCRIMINANT_PATTERNS) {
    if (item.re.test(text)) ids.push(item.id);
  }
  return ids;
}

function playbackHaystack(source: string): string {
  return source
    .toLowerCase()
    .replace(/[_./+-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function partNumbers(text: string): number[] {
  const found = new Set<number>();
  for (const match of text.matchAll(/\bpart\s*(\d+)\b/g)) {
    const value = Number(match[1]);
    if (Number.isFinite(value) && value > 0) found.add(value);
  }
  return [...found];
}

function sourceSeasonNumbers(text: string): number[] {
  const found = new Set<number>(partNumbers(text));
  for (const match of text.matchAll(/\bs0*(\d{1,2})\b/g)) {
    const value = Number(match[1]);
    if (value > 0 && value <= 20) found.add(value);
  }
  for (const match of text.matchAll(/\bbouken\s+(\d{1,2})\b/g)) {
    const value = Number(match[1]);
    if (value > 0 && value <= 20) found.add(value);
  }
  return [...found];
}

/** True when a player file path names a different season than the open title. */
export function hikkaSourceContradictsCatalog(
  source: string,
  titleTerms: string[],
): boolean {
  const hay = playbackHaystack(source);
  if (hay.length < 8 || !titleTerms.length) return false;

  const wantedText = catalogTitleBlob(titleTerms);
  const wanted = matchingDiscriminantIds(wantedText);
  const have = matchingDiscriminantIds(hay);
  if (have.some((id) => !wanted.includes(id))) return true;

  const wantedParts = partNumbers(wantedText);
  const sourceParts = sourceSeasonNumbers(hay);
  if (!wantedParts.length || !sourceParts.length) return false;
  return !sourceParts.some((part) => wantedParts.includes(part));
}

const SPECIFIC_DISCRIMINANTS = new Set([
  'tybw-calamity',
  'tybw-conflict',
  'tybw-separation',
  'stardust-egypt',
  'sbr',
  'golden-wind',
  'stone-ocean',
  'diamond',
]);

function discriminantCompatible(wanted: string[], hay: string): boolean {
  const have = matchingDiscriminantIds(hay);
  for (const id of have) {
    if (SPECIFIC_DISCRIMINANTS.has(id) && !wanted.includes(id)) return false;
  }
  if (!wanted.length) return true;
  const specificWanted = wanted.filter((id) => SPECIFIC_DISCRIMINANTS.has(id));
  if (specificWanted.length) {
    return specificWanted.some((id) => have.includes(id));
  }
  return wanted.some((id) => have.includes(id));
}

function episodeCountsCompatible(
  expected: number | null | undefined,
  actual: number | null | undefined,
  isStillAiring: boolean,
): boolean {
  if (expected == null || actual == null || expected <= 0 || actual <= 0) {
    return true;
  }
  if (isStillAiring && actual <= expected) return true;
  const delta = Math.abs(actual - expected);
  if (delta <= 4) return true;
  const ratio = delta / Math.max(expected, actual);
  return ratio <= 0.2;
}

function yearsCompatible(
  expected: number | null | undefined,
  actual: number | null | undefined,
): boolean {
  if (expected == null || actual == null) return true;
  return Math.abs(expected - actual) <= 1;
}

export function hikkaRowFitsCatalog(
  row: HikkaAnimeRow,
  hints: CatalogHints,
  titleTerms: string[],
): boolean {
  if (!formatsAreCompatible(hints.format, row.media_type)) return false;
  if (!yearsCompatible(hints.seasonYear, row.year)) return false;
  if (
    !episodeCountsCompatible(
      hints.episodeCount,
      row.episodes_total,
      Boolean(hints.isStillAiring),
    )
  ) {
    return false;
  }

  const wanted = matchingDiscriminantIds(catalogTitleBlob(titleTerms));
  if (!discriminantCompatible(wanted, hikkaRowHaystack(row))) return false;
  return true;
}

export function scoreHikkaCatalogHit(
  row: HikkaAnimeRow,
  terms: string[],
  hints: CatalogHints,
): number {
  if (!hikkaRowFitsCatalog(row, hints, terms)) return 0;

  const hay = hikkaRowHaystack(row);
  if (!hay) return 0;

  let score = 0;
  for (const term of terms) {
    const t = term.toLowerCase().trim();
    if (!t) continue;
    if (hay === t) score += 80;
    else if (hay.includes(t)) score += 40;
  }

  if (hints.malId != null && row.mal_id === hints.malId) score += 200;
  if (hints.seasonYear != null && row.year === hints.seasonYear) score += 30;
  else if (
    hints.seasonYear != null &&
    row.year != null &&
    Math.abs(row.year - hints.seasonYear) === 1
  ) {
    score += 8;
  }

  if (
    hints.episodeCount != null &&
    row.episodes_total != null &&
    Math.abs(row.episodes_total - hints.episodeCount) <= 2
  ) {
    score += 25;
  }

  if (
    normalizeCatalogFormat(hints.format) &&
    normalizeCatalogFormat(row.media_type) &&
    formatsAreCompatible(hints.format, row.media_type)
  ) {
    score += 12;
  }

  return score;
}
