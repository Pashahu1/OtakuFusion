export interface SkipSegmentRange {
  start: number;
  end: number;
}

/** Drop invalid or zero-length intro/outro hints from Anikoto API. */
export function normalizeAnikotoSkipSegment(
  segment: SkipSegmentRange | null | undefined,
): SkipSegmentRange | null {
  if (!segment) return null;
  const { start, end } = segment;
  if (typeof start !== 'number' || typeof end !== 'number') return null;
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (!(start < end)) return null;
  return { start, end };
}
