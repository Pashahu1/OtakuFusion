import type { CatalogHints } from '@/lib/catalog/catalog-hints';
import type { AnikotoSearchRow } from '@/server/anikoto/types';

function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
}

function readEpisodeCount(row: AnikotoSearchRow): number | null {
  const raw = row.episodes?.trim();
  if (!raw || !/^\d+$/.test(raw)) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function scoreTitleMatch(terms: string[], row: AnikotoSearchRow): number {
  const hay = normalizeText(row.title);
  if (!hay) return 0;

  let score = 0;
  for (const term of terms) {
    const t = normalizeText(term);
    if (!t || t.length < 2) continue;
    if (hay === t) score += 80;
    else if (hay.includes(t)) score += 40;
  }
  return score;
}

function scoreHit(row: AnikotoSearchRow, hints: CatalogHints, terms: string[]): number {
  const text = scoreTitleMatch(terms, row);
  if (text < 40) return -Infinity;

  let score = text;
  const episodes = readEpisodeCount(row);
  if (hints.episodeCount != null && episodes != null) {
    const delta = Math.abs(episodes - hints.episodeCount);
    if (delta === 0) score += 52;
    else if (delta <= 2) score += 26;
    else if (delta <= 5) score -= 28;
    else score -= 72;
  }

  const format = normalizeText(hints.format);
  const rowType = normalizeText(row.type);
  if (format && rowType) {
    if (format === rowType) score += 36;
    else if (format.includes('tv') && rowType.includes('tv')) score += 18;
  }

  return score;
}

const MIN_CONFIDENT_SCORE = 48;
const MIN_LEAD_OVER_RUNNER_UP = 16;

export function pickBestAnikotoSearchHit(
  hits: AnikotoSearchRow[],
  hints: CatalogHints,
  terms: string[],
): AnikotoSearchRow | null {
  if (!hits.length) return null;

  const ranked = hits
    .map((h) => ({ h, s: scoreHit(h, hints, terms) }))
    .filter((row) => Number.isFinite(row.s))
    .sort((a, b) => b.s - a.s);

  const best = ranked[0];
  if (!best || best.s < MIN_CONFIDENT_SCORE) return null;
  if (ranked.length > 1 && best.s - ranked[1].s < MIN_LEAD_OVER_RUNNER_UP) return null;

  return best.h;
}
