import type Artplayer from 'artplayer';
import Hls from 'hls.js';

import { lockHlsQualityLevel } from '../../playback-preferences/lockHlsQualityLevel';
import {
  getHighestAvailableLevelIndex,
  readHlsQualityPreference,
  resolveLevelIndexForStoredQuality,
} from '../../playerPlaybackPreferences';

export function createHlsBeforeLoadHandler() {
  return (hls: InstanceType<typeof Hls>) => {
    const applyInitialLevelOnce = () => {
      hls.off(Hls.Events.MANIFEST_PARSED, applyInitialLevelOnce);
      try {
        const levels = hls.levels as Array<{ height?: number; bitrate?: number }>;
        if (!levels?.length) {
          lockHlsQualityLevel(hls, -1);
          return;
        }
        const stored = readHlsQualityPreference();
        const fromPref = resolveLevelIndexForStoredQuality(levels, stored);
        const idx =
          stored === 'auto'
            ? -1
            : fromPref >= 0
              ? fromPref
              : getHighestAvailableLevelIndex(levels);
        lockHlsQualityLevel(hls, idx);
      } finally {
        try {
          hls.startLoad();
        } catch {
          /* noop */
        }
      }
    };
    hls.on(Hls.Events.MANIFEST_PARSED, applyInitialLevelOnce);
  };
}

/** Teardown Hls instance before fatal playback error callback. */
export function teardownArtplayerHls(art: Artplayer) {
  try {
    if (art.hls) {
      art.hls.stopLoad();
      art.hls.destroy();
      art.hls = null;
    }
  } catch {
    /* noop */
  }
}
