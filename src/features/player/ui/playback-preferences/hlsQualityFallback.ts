import type Hls from 'hls.js';

import { getNextLowerLevelIndex } from './hlsQualityLevels';

/** Step down one rendition when the current level fails to load. */
export function tryDowngradeHlsQualityLevel(hls: InstanceType<typeof Hls>): boolean {
  const levels = hls.levels as Array<{ height?: number }>;
  const next = getNextLowerLevelIndex(levels, hls.currentLevel);
  if (next == null) return false;
  try {
    hls.currentLevel = next;
    hls.nextLevel = next;
    hls.loadLevel = next;
    hls.startLoad();
    return true;
  } catch {
    return false;
  }
}
