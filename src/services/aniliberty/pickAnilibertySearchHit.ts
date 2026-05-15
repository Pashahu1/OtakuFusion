import type { CrysolineAnilibertySearchRow } from '@/server/crysoline/anilibertyClient';
import type { AnimepaheCatalogHints } from '@/services/animepahe/catalogHints';

function normalizeFormat(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function haystack(hit: CrysolineAnilibertySearchRow): string {
  const t = hit.title;
  const parts = [
    t?.english,
    t?.other,
    hit.metadata?.alias,
  ].filter((x): x is string => typeof x === 'string' && Boolean(x.trim()));
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
  hints: AnimepaheCatalogHints,
  terms: string[]
): number {
  let score = qualityOfMatch(terms, hit);
  const year = typeof hit.year === 'number' ? hit.year : null;
  if (hints.seasonYear != null && year === hints.seasonYear) score += 58;
  else if (hints.seasonYear != null && year != null && Math.abs(year - hints.seasonYear) === 1) {
    score += 14;
  }

  const te = typeof hit.totalEpisodes === 'number' ? hit.totalEpisodes : null;
  if (hints.episodeCount != null && te === hints.episodeCount) score += 52;
  else if (
    hints.episodeCount != null &&
    te != null &&
    Math.abs(te - hints.episodeCount) <= 2
  ) {
    score += 26;
  }

  const hf = normalizeFormat(hints.format);
  const mt = normalizeFormat(hit.metadata?.type);
  if (hf && mt) {
    if (hf === mt) score += 36;
    else if (hf.includes('tv') && mt.includes('tv')) score += 18;
  }

  return score;
}

/** Мінімальний сумарний скор; якщо два топ-хіти близькі — не беремо (ризик чужого тайтлу). */
const MIN_CONFIDENT_SCORE = 40;
const MIN_LEAD_OVER_RUNNER_UP = 14;

export function pickBestAnilibertySearchHit(
  hits: CrysolineAnilibertySearchRow[],
  hints: AnimepaheCatalogHints,
  terms: string[]
): CrysolineAnilibertySearchRow | null {
  if (!hits.length) return null;
  const ranked = hits
    .map((h) => ({ h, s: scoreHit(h, hints, terms) }))
    .sort((a, b) => b.s - a.s);
  const best = ranked[0];
  if (!best || best.s < MIN_CONFIDENT_SCORE) return null;
  if (ranked.length > 1 && best.s - ranked[1].s < MIN_LEAD_OVER_RUNNER_UP) return null;
  return best.h;
}
