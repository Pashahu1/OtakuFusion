import type Hls from 'hls.js';

import { getNextLowerLevelIndex } from './hlsQualityLevels';
import { lockHlsQualityLevel } from './lockHlsQualityLevel';

/** Step down one rendition when the current level fails to load. */
export function tryDowngradeHlsQualityLevel(hls: InstanceType<typeof Hls>): boolean {
  const levels = hls.levels as Array<{ height?: number }>;
  const next = getNextLowerLevelIndex(levels, hls.currentLevel);
  if (next == null) return false;
  try {
    lockHlsQualityLevel(hls, next, { startLoad: true });
    return true;
  } catch {
    return false;
  }
}
