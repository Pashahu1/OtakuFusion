import type { CrysolineAnimepaheSearchRow } from '@/server/crysoline/animepaheClient';
import type { AnimepaheCatalogHints } from '@/lib/catalog/providers/animepahe/catalogHints';

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
  const text = qualityOfMatch(terms, hit);
  /** ╨æ╨╡╨╖ ╤à╨╛╤ç╨░ ╨▒ ╨╛╨┤╨╜╨╛╨│╨╛ ╨╖╨▒╤û╨│╤â ╨┐╤û╨┤╤Ç╤Å╨┤╨║╨░ ╨╖ ╤é╨╛╨║╨╡╨╜╨░ ╨╖╨░╨┐╨╕╤é╤â ΓÇö ╨╜╨╡ ╨┤╨╛╨▓╤û╤Ç╤Å╤ö╨╝╨╛ ╨╗╨╕╤ê╨╡ ╤Ç╨╛╨║╤â/╤ä╨╛╤Ç╨╝╨░╤é╤â. */
  if (text < 42) return -Infinity;

  let score = text;

  if (hints.seasonYear != null && hit.year === hints.seasonYear) score += 58;
  else if (hints.seasonYear != null && Math.abs(hit.year - hints.seasonYear) === 1) {
    score += 14;
  }

  if (hints.episodeCount != null && Number.isFinite(hit.totalEpisodes) && hit.totalEpisodes > 0) {
    const d = Math.abs(hit.totalEpisodes - hints.episodeCount);
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

/** Animepahe search ╤ê╤â╨╝╨╜╤û╤ê╨╕╨╣ ╨╖╨░ Anilibria ΓÇö ╤é╤Ç╨╛╤à╨╕ ╨▓╨╕╤ë╨╕╨╣ ╨┐╨╛╤Ç╤û╨│ ╤û ╨▓╤û╨┤╤Ç╨╕╨▓ ╨▓╤û╨┤ 2-╨│╨╛ ╨╝╤û╤ü╤å╤Å. */
const MIN_CONFIDENT_SCORE = 48;
const MIN_LEAD_OVER_RUNNER_UP = 16;

export function pickBestAnimepaheSearchHit(
  hits: CrysolineAnimepaheSearchRow[],
  hints: AnimepaheCatalogHints,
  terms: string[]
): CrysolineAnimepaheSearchRow | null {
  if (!hits.length) return null;
  const ranked = hits
    .map((h) => ({ h, s: scoreHit(h, hints, terms) }))
    .sort((a, b) => b.s - a.s);
  const best = ranked[0];
  if (!best || !Number.isFinite(best.s) || best.s < MIN_CONFIDENT_SCORE) return null;
  if (ranked.length > 1 && best.s - ranked[1].s < MIN_LEAD_OVER_RUNNER_UP) return null;
  return best.h;
}

/** ╨»╨║╤ë╨╛ ┬½╨▓╨┐╨╡╨▓╨╜╨╡╨╜╨╛╨│╨╛┬╗ ╨╝╨░╤é╤ç╤â ╨╜╨╡╨╝╨░╤ö ΓÇö ╨▒╨╡╤Ç╨╡╨╝╨╛ ╨╜╨░╨╣╨║╤Ç╨░╤ë╨╕╨╣ ╨╖╨░ score (╨╝╤û╨╜╤û╨╝╤â╨╝ ╨╖╨▒╤û╨│ ╨┐╤û╨┤╤Ç╤Å╨┤╨║╨░). */
export function pickBestAnimepaheSearchHitRelaxed(
  hits: CrysolineAnimepaheSearchRow[],
  hints: AnimepaheCatalogHints,
  terms: string[]
): CrysolineAnimepaheSearchRow | null {
  if (!hits.length) return null;
  const ranked = hits
    .map((h) => ({ h, s: scoreHit(h, hints, terms) }))
    .sort((a, b) => b.s - a.s);
  const best = ranked[0];
  if (!best || !Number.isFinite(best.s) || best.s < 42) return null;
  return best.h;
}
