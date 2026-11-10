import artplayerPluginAnime4k from 'artplayer-plugin-anime4k';

import { tStatic } from '@/i18n/t';

import {
  fromPluginAnime4kMode,
  readAnime4kEnhanceMode,
  toPluginAnime4kMode,
  writeAnime4kEnhanceMode,
} from '../playback-preferences/anime4kMode';

export function createArtplayerAnime4kPlugin() {
  return artplayerPluginAnime4k({
    mode: toPluginAnime4kMode(readAnime4kEnhanceMode()),
    setting: false,
    labels: {
      auto: tStatic('player.auto'),
      off: tStatic('player.off'),
      balanced: tStatic('player.restore'),
      quality: tStatic('player.qualityMode'),
      struggling: tStatic('player.heavyGpu'),
    },
    onModeChange: (mode) => {
      writeAnime4kEnhanceMode(fromPluginAnime4kMode(mode));
    },
    onError: () => undefined,
  });
}
