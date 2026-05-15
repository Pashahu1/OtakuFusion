import type { CrysolineAnilibertySearchRow } from '@/server/crysoline/anilibertyClient';
import type { AnimepaheCatalogHints } from '@/services/animepahe/catalogHints';

function normalizeFormat(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function haystack(hit: CrysolineAnilibertySearchRow): string {
  const t = hit.title;
  return [t?.english, t?.other]
    .filter((x): x is string => Boolean(x?.trim()))
    .join(' ')
    .toLowerCase();
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

export function pickBestAnilibertySearchHit(
  hits: CrysolineAnilibertySearchRow[],
  hints: AnimepaheCatalogHints,
  terms: string[]
): CrysolineAnilibertySearchRow | null {
  if (!hits.length) return null;
  let best: CrysolineAnilibertySearchRow | null = null;
  let bestScore = -Infinity;
  for (const h of hits) {
    const s = scoreHit(h, hints, terms);
    if (s > bestScore) {
      bestScore = s;
      best = h;
    }
  }
  return best;
}
