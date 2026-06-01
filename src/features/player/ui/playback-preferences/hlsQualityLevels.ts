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

/** Highest level in manifest (1080p+ when available). */
export function getHighestAvailableLevelIndex(
  levels: Array<{ height?: number; bitrate?: number }>,
): number {
  if (!levels.length) return -1;
  const ranked = levels
    .map((level, index) => ({
      index,
      height: Number(level.height ?? 0),
      bitrate: Number(level.bitrate ?? 0),
    }))
    .filter((x) => Number.isFinite(x.height) && x.height > 0)
    .sort((a, b) => b.height - a.height || b.bitrate - a.bitrate);
  if (!ranked.length) return levels.length - 1;
  return ranked[0].index;
}

/** Prefer 480p; otherwise lowest available level. */
export function getDataSaverLevelIndex(levels: Array<{ height?: number }>): number {
  if (!levels.length) return -1;
  const withHeight = levels
    .map((level, index) => ({ index, height: Number(level.height ?? 0) }))
    .filter((item) => Number.isFinite(item.height) && item.height > 0);
  if (!withHeight.length) return levels.length - 1;

  const atOrBelow480 = withHeight
    .filter((item) => item.height <= 480)
    .sort((a, b) => b.height - a.height);
  if (atOrBelow480.length) return atOrBelow480[0].index;

  return withHeight.sort((a, b) => a.height - b.height)[0].index;
}

/** Step down one level when the current rendition fails to load. */
export function getNextLowerLevelIndex(
  levels: Array<{ height?: number }>,
  currentIndex: number,
): number | null {
  if (!levels.length || currentIndex < 0) return null;
  const currentHeight = Number(levels[currentIndex]?.height ?? 0);
  if (!Number.isFinite(currentHeight) || currentHeight <= 0) return null;

  const lower = levels
    .map((level, index) => ({ index, height: Number(level.height ?? 0) }))
    .filter((item) => Number.isFinite(item.height) && item.height > 0 && item.height < currentHeight)
    .sort((a, b) => b.height - a.height);

  return lower[0]?.index ?? null;
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
