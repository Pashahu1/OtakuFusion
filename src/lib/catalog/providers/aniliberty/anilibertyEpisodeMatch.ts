import type { CrysolineAnilibertySearchRow } from '@/server/crysoline/anilibertyClient';
import type { CatalogHints } from '@/lib/catalog/catalog-hints';

/** Допустима різниця для завершених релізів. */
export const ANILIBERTY_EPISODE_COUNT_MAX_DELTA = 2;

export function isAnilistStillAiringFromStatus(
  status: string | null | undefined
): boolean {
  const s = (status ?? '').trim().toLowerCase();
  if (!s) return false;
  if (s.includes('not yet aired') || s.includes('not-yet-aired')) return false;
  if (s.includes('cancel')) return false;
  return (
    s.includes('currently airing') ||
    s.includes('releasing') ||
    s.includes('ongoing') ||
    s === 'airing'
  );
}

export function parseExpectedEpisodeCountFromHints(
  hints: CatalogHints
): number | null {
  const n = hints.episodeCount;
  if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

export function isAnilibertyReleaseOngoing(
  hit: { metadata?: { isOngoing?: boolean | null } | null } | null | undefined
): boolean {
  return hit?.metadata?.isOngoing === true;
}

export function readAnilibertySearchEpisodeCount(
  hit: CrysolineAnilibertySearchRow | null | undefined
): number | null {
  const te = hit?.totalEpisodes;
  if (typeof te !== 'number' || !Number.isFinite(te) || te <= 0) return null;
  return Math.floor(te);
}

function isLenientEpisodeCountMode(options?: {
  isOngoing?: boolean | null;
  allowPartialCatalog?: boolean | null;
}): boolean {
  return options?.isOngoing === true || options?.allowPartialCatalog === true;
}

/**
 * Завершений тайтл: кількість має збігатися (±2).
 * Ще виходить (AniList / Crysoline ongoing): менше епізодів у джерелі — OK.
 * Занадто багато епізодів у джерелі — не той реліз.
 */
export function isAnilibertyEpisodeCountAcceptable(
  expected: number | null | undefined,
  actual: number | null | undefined,
  options?: { isOngoing?: boolean | null; allowPartialCatalog?: boolean | null }
): boolean {
  if (isLenientEpisodeCountMode(options)) return true;
  if (expected == null || expected <= 0) return true;
  if (actual == null || actual <= 0) return false;

  const exp = Math.floor(expected);
  const act = Math.floor(actual);

  if (act > exp + ANILIBERTY_EPISODE_COUNT_MAX_DELTA) return false;

  if (act < exp - ANILIBERTY_EPISODE_COUNT_MAX_DELTA) {
    return false;
  }

  return Math.abs(act - exp) <= ANILIBERTY_EPISODE_COUNT_MAX_DELTA;
}

export function isAnilibertyHitEligible(
  hit: CrysolineAnilibertySearchRow,
  hints: CatalogHints
): boolean {
  const expected = parseExpectedEpisodeCountFromHints(hints);
  if (expected == null) return true;

  const lenient =
    isAnilibertyReleaseOngoing(hit) || hints.isStillAiring === true;
  const searchCount = readAnilibertySearchEpisodeCount(hit);
  if (searchCount == null) return true;

  return isAnilibertyEpisodeCountAcceptable(expected, searchCount, {
    isOngoing: lenient,
    allowPartialCatalog: hints.isStillAiring === true,
  });
}

export function buildAnilibertyEpisodeMatchOptions(
  hints: CatalogHints,
  hit?: CrysolineAnilibertySearchRow | null
): { isOngoing: boolean; allowPartialCatalog: boolean } {
  const stillAiring = hints.isStillAiring === true;
  const ongoing = hit ? isAnilibertyReleaseOngoing(hit) : false;
  return {
    isOngoing: ongoing || stillAiring,
    allowPartialCatalog: stillAiring,
  };
}
