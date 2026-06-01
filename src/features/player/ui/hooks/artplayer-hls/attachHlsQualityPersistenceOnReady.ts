import type Artplayer from 'artplayer';
import Hls from 'hls.js';

import {
  attachHlsQualityPreferencePersistence,
  readHlsQualityPreference,
} from '../../playerPlaybackPreferences';

export function attachHlsQualityPersistenceOnReady(
  art: Artplayer,
  useManualStreamQuality: boolean,
) {
  if (useManualStreamQuality) return;

  const storedQualitySnapshot = readHlsQualityPreference();
  const plugins = art.plugins as unknown as {
    artplayerPluginHlsControl?: { update?: () => void };
  };
  const syncHlsQualityUi = () => {
    plugins.artplayerPluginHlsControl?.update?.();
  };
  const hlsInstance = art.hls;

  if (!hlsInstance) return;

  let detachQualityPersist: (() => void) | null = null;
  const onDestroyHlsUi = () => {
    hlsInstance.off(Hls.Events.MANIFEST_PARSED, syncHlsQualityUi);
    hlsInstance.off(Hls.Events.LEVEL_SWITCHED, syncHlsQualityUi);
    detachQualityPersist?.();
    detachQualityPersist = null;
  };

  hlsInstance.on(Hls.Events.MANIFEST_PARSED, syncHlsQualityUi);
  hlsInstance.on(Hls.Events.LEVEL_SWITCHED, syncHlsQualityUi);
  syncHlsQualityUi();
  detachQualityPersist = attachHlsQualityPreferencePersistence(hlsInstance, syncHlsQualityUi, {
    muteInitialPersistenceMs:
      storedQualitySnapshot === null ||
      storedQualitySnapshot === 'best-display' ||
      storedQualitySnapshot === 'auto'
        ? 2200
        : 0,
  });
  art.on('destroy', onDestroyHlsUi);
}
