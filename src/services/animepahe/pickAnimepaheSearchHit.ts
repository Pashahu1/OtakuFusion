import type { CrysolineAnimepaheSearchRow } from '@/server/crysoline/animepaheClient';
import type { AnimepaheCatalogHints } from '@/services/animepahe/catalogHints';

function normalizeFormat(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function haystack(hit: CrysolineAnimepaheSearchRow): string {
  const t = hit.title;
  return [t?.romaji, t?.english, t?.native]
    .filter((x): x is string => Boolean(x?.trim()))
    .join(' ')
    .toLowerCase();
}

function qualityOfMatch(terms: string[], hit: CrysolineAnimepaheSearchRow): number {
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
  hit: CrysolineAnimepaheSearchRow,
  hints: AnimepaheCatalogHints,
  terms: string[]
): number {
  let score = qualityOfMatch(terms, hit);

  if (hints.seasonYear != null && hit.year === hints.seasonYear) score += 58;
  else if (hints.seasonYear != null && Math.abs(hit.year - hints.seasonYear) === 1) {
    score += 14;
  }

  if (hints.episodeCount != null && hit.totalEpisodes === hints.episodeCount) score += 52;
  else if (
    hints.episodeCount != null &&
    Math.abs(hit.totalEpisodes - hints.episodeCount) <= 2
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

export function pickBestAnimepaheSearchHit(
  hits: CrysolineAnimepaheSearchRow[],
  hints: AnimepaheCatalogHints,
  terms: string[]
): CrysolineAnimepaheSearchRow | null {
  if (!hits.length) return null;
  let best: CrysolineAnimepaheSearchRow | null = null;
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
