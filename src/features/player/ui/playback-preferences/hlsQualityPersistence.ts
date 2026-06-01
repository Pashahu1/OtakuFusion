import Hls from 'hls.js';

import { getPreferred1080LevelIndex } from './hlsQualityLevels';
import {
  readHlsQualityPreference,
  writeHlsQualityPreference,
  type HlsQualityPreference,
} from './hlsQualityStorage';

export interface AttachHlsQualityPersistOptions {
  muteInitialPersistenceMs?: number;
}

function readAutoLevelFlag(hls: { loadLevel?: number; autoLevelEnabled?: boolean }): boolean {
  if (typeof hls.autoLevelEnabled === 'boolean') return hls.autoLevelEnabled;
  return hls.loadLevel === -1;
}

export function attachHlsQualityPreferencePersistence(
  hls: InstanceType<typeof Hls>,
  onAfterPersist?: () => void,
  options?: AttachHlsQualityPersistOptions,
): () => void {
  let allowPersist = false;
  const unlockTimer = window.setTimeout(() => {
    allowPersist = true;
  }, 450);

  const muteUntil = Date.now() + (options?.muteInitialPersistenceMs ?? 0);

  const handler = () => {
    if (!allowPersist) return;
    if (Date.now() < muteUntil) return;

    const stored = readHlsQualityPreference();
    const auto = readAutoLevelFlag(
      hls as { loadLevel?: number; autoLevelEnabled?: boolean },
    );

    if (auto) {
      writeHlsQualityPreference('auto');
      onAfterPersist?.();
      return;
    }

    const idx = hls.currentLevel;
    const h = idx >= 0 ? Number(hls.levels[idx]?.height ?? 0) : 0;

    if (stored === 'best-display' || stored === null || stored === 'auto') {
      const levelsArr = hls.levels as Array<{ height?: number; bitrate?: number }>;
      const expected = getPreferred1080LevelIndex(levelsArr);
      if (idx === expected && Number.isFinite(h) && h > 0 && idx >= 0) {
        onAfterPersist?.();
        return;
      }
      if (Number.isFinite(h) && h > 0 && idx >= 0) {
        writeHlsQualityPreference({ height: h });
      }
      onAfterPersist?.();
      return;
    }

    if (Number.isFinite(h) && h > 0) writeHlsQualityPreference({ height: h });
    onAfterPersist?.();
  };

  hls.on(Hls.Events.LEVEL_SWITCHED, handler);
  return () => {
    window.clearTimeout(unlockTimer);
    hls.off(Hls.Events.LEVEL_SWITCHED, handler);
  };
}

export type { HlsQualityPreference };
