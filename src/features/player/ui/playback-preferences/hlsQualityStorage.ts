import {
  getBestLevelIndexForDisplay,
  getPreferred720LevelIndex,
} from './hlsQualityLevels';

const HLS_QUALITY_KEY = 'otakufusion:player:hls-quality';
export const DEFAULT_HLS_QUALITY_HEIGHT = 720;

/** Stored HLS quality choice: `auto` (ABR capped at 720p), `best-display`, specific height, or empty — start ~720p. */
export type HlsQualityPreference =
  | 'auto'
  | 'best-display'
  | { height: number };

export function readHlsQualityPreference(): HlsQualityPreference | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HLS_QUALITY_KEY)?.trim();
    if (!raw) return { height: DEFAULT_HLS_QUALITY_HEIGHT };
    if (raw === 'auto') return 'auto';
    if (raw === 'best-display' || raw === 'best') return 'best-display';
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) {
      const h = Math.floor(n);
      if (h < DEFAULT_HLS_QUALITY_HEIGHT) return { height: DEFAULT_HLS_QUALITY_HEIGHT };
      return { height: h };
    }
    return { height: DEFAULT_HLS_QUALITY_HEIGHT };
  } catch {
    return { height: DEFAULT_HLS_QUALITY_HEIGHT };
  }
}

export function writeHlsQualityPreference(pref: HlsQualityPreference): void {
  if (typeof window === 'undefined') return;
  try {
    if (pref === 'auto') localStorage.setItem(HLS_QUALITY_KEY, 'auto');
    else if (pref === 'best-display')
      localStorage.setItem(HLS_QUALITY_KEY, 'best-display');
    else localStorage.setItem(HLS_QUALITY_KEY, String(pref.height));
  } catch {
    /* ignore */
  }
}

/** Level index; `auto` no longer returns −1 — only cap to 720p (see `resolveLevelIndexForStoredQuality`). */
export function resolveLevelIndexForStoredQuality(
  levels: Array<{ height?: number; bitrate?: number }>,
  pref: HlsQualityPreference | null,
): number {
  if (!levels.length) return -1;
  if (pref === 'auto' || pref === null) {
    return getPreferred720LevelIndex(levels);
  }
  if (pref === 'best-display') {
    return getBestLevelIndexForDisplay(levels);
  }

  const target = pref.height;
  const ranked = levels
    .map((level, index) => ({
      index,
      height: Number(level.height ?? 0),
    }))
    .filter((x) => Number.isFinite(x.height) && x.height > 0);

  if (!ranked.length) return -1;

  const exact = ranked.find((x) => x.height === target);
  if (exact) return exact.index;

  const atOrBelow = ranked
    .filter((x) => x.height <= target)
    .sort((a, b) => b.height - a.height);
  if (atOrBelow.length) return atOrBelow[0].index;

  return ranked.sort((a, b) => a.height - b.height)[0]?.index ?? -1;
}
