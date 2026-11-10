import type Artplayer from 'artplayer';

import { tStatic } from '@/i18n/t';

import { patchTracksPanelModel } from '../netflix-tracks/tracksPanelModel';
import {
  type Anime4kEnhanceMode,
  fromPluginAnime4kMode,
  toPluginAnime4kMode,
  writeAnime4kEnhanceMode,
} from '../playback-preferences/anime4kMode';
import { getAnime4kPlugin } from './getAnime4kPlugin';

function enhanceOptions(): Array<{ id: Anime4kEnhanceMode; label: string }> {
  return [
    { id: 'off', label: tStatic('player.off') },
    { id: 'restore', label: tStatic('player.restore') },
    { id: 'quality', label: tStatic('player.qualityMode') },
    { id: 'auto', label: tStatic('player.auto') },
  ];
}

function syncEnhanceOptions(art: Artplayer, selected: Anime4kEnhanceMode): void {
  patchTracksPanelModel(art, {
    enhance: enhanceOptions().map((item) => ({
      id: item.id,
      label: item.label,
      active: item.id === selected,
    })),
    onSelectEnhance: (id) => {
      const plugin = getAnime4kPlugin(art);
      if (!plugin) return;
      const mode = enhanceOptions().find((item) => item.id === id)?.id;
      if (!mode) return;
      plugin.setMode(toPluginAnime4kMode(mode));
      writeAnime4kEnhanceMode(mode);
      syncEnhanceOptions(art, mode);
    },
  });
}

/** Fill the Enhance column once WebGPU is confirmed; stay hidden when it is not. */
export function attachAnime4kEnhance(art: Artplayer): () => void {
  const plugin = getAnime4kPlugin(art);
  if (!plugin) return () => undefined;

  let cancelled = false;
  void plugin.ready.then((supported) => {
    if (cancelled || !supported) return;
    syncEnhanceOptions(art, fromPluginAnime4kMode(plugin.getMode()));
  });

  return () => {
    cancelled = true;
  };
}
