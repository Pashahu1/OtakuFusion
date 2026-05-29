import type { CrysolineAnilibertySearchRow } from '@/server/crysoline/anilibertyClient';
import type { CatalogHints } from '@/lib/catalog/catalog-hints';
import {
  isAnilibertyHitEligible,
  readAnilibertySearchEpisodeCount,
} from '@/lib/catalog/providers/aniliberty/anilibertyEpisodeMatch';

function normalizeFormat(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function haystack(hit: CrysolineAnilibertySearchRow): string {
  const t = hit.title;
  const parts = [t?.english, t?.other, hit.metadata?.alias].filter(
    (x): x is string => typeof x === 'string' && Boolean(x.trim())
  );
  return parts.join(' ').toLowerCase();
}

function qualityOfMatch(terms: string[], hit: CrysolineAnilibertySearchRow): number {
  const h = haystack(hit);
  let score = 0;
  for (const raw of terms) {
    const n = raw.trim().toLowerCase();
    if (!n || n.length < 2) continue;
    if (h.includes(n)) score += 42;
    const head = n.slice(0, Math.min(8, n.length));
    if (head.length >= 3 && h.includes(head)) score += 12;
  }
  return score;
}

function scoreHit(
  hit: CrysolineAnilibertySearchRow,
  hints: CatalogHints,
  terms: string[]
): number {
  const text = qualityOfMatch(terms, hit);
  /** Without title match — do not trust year / count alone. */
  if (text < 42) return -Infinity;

  let score = text;
  const year = typeof hit.year === 'number' ? hit.year : null;
  if (hints.seasonYear != null && year === hints.seasonYear) score += 58;
  else if (hints.seasonYear != null && year != null && Math.abs(year - hints.seasonYear) === 1) {
    score += 14;
  }

  const te = readAnilibertySearchEpisodeCount(hit);
  if (hints.episodeCount != null && te != null) {
    const d = Math.abs(te - hints.episodeCount);
    if (d === 0) score += 52;
    else if (d <= 2) score += 26;
    else if (d <= 5) score -= 28;
    else score -= 72;
  }

  const hf = normalizeFormat(hints.format);
  const mt = normalizeFormat(hit.metadata?.type);
  if (hf && mt) {
    if (hf === mt) score += 36;
    else if (hf.includes('tv') && mt.includes('tv')) score += 18;
  }

  return score;
}

const MIN_CONFIDENT_SCORE = 48;
const MIN_LEAD_OVER_RUNNER_UP = 16;

export function pickBestAnilibertySearchHit(
  hits: CrysolineAnilibertySearchRow[],
  hints: CatalogHints,
  terms: string[]
): CrysolineAnilibertySearchRow | null {
  if (!hits.length) return null;

  const eligible = hits.filter((h) => isAnilibertyHitEligible(h, hints));
  const pool = eligible.length > 0 ? eligible : [];

  if (!pool.length) return null;

  const ranked = pool
    .map((h) => ({ h, s: scoreHit(h, hints, terms) }))
    .filter((row) => Number.isFinite(row.s))
    .sort((a, b) => b.s - a.s);

  const best = ranked[0];
  if (!best || best.s < MIN_CONFIDENT_SCORE) return null;
  if (ranked.length > 1 && best.s - ranked[1].s < MIN_LEAD_OVER_RUNNER_UP) return null;

  return best.h;
}
