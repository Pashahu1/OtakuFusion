/**
 * Approximate display short side in physical pixels (pick level for monitor / DPR).
 */
export function getApproxDisplayShortSidePx(): number {
  if (typeof window === 'undefined') return 1080;
  const dpr = Math.min(window.devicePixelRatio ?? 1, 3);
  const sw = window.screen.width * dpr;
  const sh = window.screen.height * dpr;
  return Math.round(Math.min(sw, sh));
}

/**
 * Highest available level not exceeding display; if manifest only has lower levels —
 * take highest available (best picture on 2K etc.).
 */
export function getBestLevelIndexForDisplay(
  levels: Array<{ height?: number; bitrate?: number }>,
): number {
  if (!levels.length) return -1;
  const cap = getApproxDisplayShortSidePx();
  const ranked = levels
    .map((level, index) => ({
      index,
      height: Number(level.height ?? 0),
      bitrate: Number(level.bitrate ?? 0),
    }))
    .filter((x) => Number.isFinite(x.height) && x.height > 0)
    .sort((a, b) => b.height - a.height || b.bitrate - a.bitrate);

  if (!ranked.length) return levels.length - 1;

  const fits = ranked.filter((x) => x.height <= cap);
  if (fits.length) return fits[0].index;

  return ranked[ranked.length - 1].index;
}

/** Highest level not above 720p; if manifest only has higher — lowest available. */
export function getPreferred720LevelIndex(
  levels: Array<{ height?: number }>,
): number {
  if (!levels.length) return -1;
  const withHeight = levels
    .map((level, index) => ({ index, height: Number(level.height ?? 0) }))
    .filter((item) => Number.isFinite(item.height) && item.height > 0);
  if (!withHeight.length) return levels.length - 1;

  const atOrBelow720 = withHeight
    .filter((item) => item.height <= 720)
    .sort((a, b) => b.height - a.height);
  if (atOrBelow720.length) return atOrBelow720[0].index;

  const above720 = withHeight.sort((a, b) => a.height - b.height);
  return above720[0].index;
}

/** Default quality level (highest not above 1080p) when localStorage has no choice yet. */
export function getPreferred1080LevelIndex(
  levels: Array<{ height?: number }>,
): number {
  if (!levels.length) return -1;
  const withHeight = levels
    .map((level, index) => ({ index, height: Number(level.height ?? 0) }))
    .filter((item) => Number.isFinite(item.height) && item.height > 0);
  if (!withHeight.length) return levels.length - 1;

  const atOrBelow1080 = withHeight
    .filter((item) => item.height <= 1080)
    .sort((a, b) => b.height - a.height);
  if (atOrBelow1080.length) return atOrBelow1080[0].index;

  const above1080 = withHeight.sort((a, b) => a.height - b.height);
  return above1080[0].index;
}
