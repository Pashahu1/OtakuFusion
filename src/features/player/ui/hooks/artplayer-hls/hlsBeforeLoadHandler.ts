import type Artplayer from 'artplayer';
import Hls from 'hls.js';

import {
  readHlsQualityPreference,
  resolveLevelIndexForStoredQuality,
} from '../../playerPlaybackPreferences';

export function createHlsBeforeLoadHandler() {
  return (hls: InstanceType<typeof Hls>) => {
    const storedQualitySnapshot = readHlsQualityPreference();
    const applyInitialLevelOnce = () => {
      hls.off(Hls.Events.MANIFEST_PARSED, applyInitialLevelOnce);
      try {
        if (!hls.levels?.length) {
          hls.loadLevel = -1;
          return;
        }
        const idx = resolveLevelIndexForStoredQuality(
          hls.levels as Array<{ height?: number; bitrate?: number }>,
          storedQualitySnapshot,
        );
        if (idx < 0) {
          hls.currentLevel = 0;
          hls.nextLevel = 0;
          hls.loadLevel = 0;
        } else {
          hls.currentLevel = idx;
          hls.nextLevel = idx;
          hls.loadLevel = idx;
        }
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
