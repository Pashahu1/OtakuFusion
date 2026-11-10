import type Artplayer from 'artplayer';
import Hls from 'hls.js';

import type { StreamingData } from '@/shared/types/StreamingTypes';
import { lockHlsQualityLevel } from '../playback-preferences/lockHlsQualityLevel';
import { writeHlsQualityPreference } from '../playerPlaybackPreferences';
import { switchArtplayerToPlaylist } from '../attachStreamQualityMenu';
import { patchTracksPanelModel } from './tracksPanelModel';
import {
  buildHlsLadderQualityOptions,
  buildVariantQualityOptions,
} from './buildPlaybackQualityOptions';

function isAutoLevel(hls: InstanceType<typeof Hls>): boolean {
  if (typeof hls.autoLevelEnabled === 'boolean') return hls.autoLevelEnabled;
  return hls.loadLevel === -1;
}

function syncHlsQualityOptions(art: Artplayer, hls: InstanceType<typeof Hls>): void {
  const levels = hls.levels as Array<{ height?: number; bitrate?: number }>;
  const auto = isAutoLevel(hls);
  patchTracksPanelModel(art, {
    quality: buildHlsLadderQualityOptions(levels, hls.currentLevel, auto),
    onSelectQuality: (id) => {
      if (id === 'hls:auto') {
        lockHlsQualityLevel(hls, -1);
        writeHlsQualityPreference('auto');
        syncHlsQualityOptions(art, hls);
        return;
      }
      const match = /^hls:(\d+)$/.exec(id);
      if (!match) return;
      const index = Number(match[1]);
      const height = Number(levels[index]?.height ?? 0);
      lockHlsQualityLevel(hls, index);
      if (Number.isFinite(height) && height > 0) {
        writeHlsQualityPreference({ height });
      }
      syncHlsQualityOptions(art, hls);
    },
  });
}

function syncVariantQualityOptions(
  art: Artplayer,
  streamInfo: StreamingData,
  activeUrl: string,
): void {
  const variants = streamInfo.qualityVariants ?? [];
  patchTracksPanelModel(art, {
    quality: buildVariantQualityOptions(variants, activeUrl),
    onSelectQuality: (id) => {
      const variant = variants.find((item) => {
        const url = item.url?.trim() ?? '';
        return url && id === `variant:${item.height}:${url}`;
      });
      if (!variant) return;
      const nextUrl = variant.url?.trim();
      if (!nextUrl) return;
      writeHlsQualityPreference({ height: variant.height });
      switchArtplayerToPlaylist(art, streamInfo, nextUrl);
      syncVariantQualityOptions(art, streamInfo, nextUrl);
    },
  });
}

/** Fill the Audio/Subtitles panel with a Quality column (HLS ladder or separate playlists). */
export function attachPlaybackQualityTracks(
  art: Artplayer,
  streamInfo: StreamingData | null | undefined,
  streamUrl: string | null | undefined,
): () => void {
  const variants = streamInfo?.qualityVariants;
  if (streamInfo && variants && variants.length >= 2) {
    syncVariantQualityOptions(art, streamInfo, streamUrl?.trim() || variants[0]?.url || '');
    return () => undefined;
  }

  const hls = art.hls as InstanceType<typeof Hls> | undefined;
  if (!hls) {
    const retry = () => {
      art.off('video:loadeddata', retry);
      if (!art.hls) return;
      attachPlaybackQualityTracks(art, streamInfo, streamUrl);
    };
    art.on('video:loadeddata', retry);
    return () => {
      art.off('video:loadeddata', retry);
    };
  }

  const sync = () => syncHlsQualityOptions(art, hls);
  hls.on(Hls.Events.MANIFEST_PARSED, sync);
  hls.on(Hls.Events.LEVEL_SWITCHED, sync);
  sync();

  return () => {
    hls.off(Hls.Events.MANIFEST_PARSED, sync);
    hls.off(Hls.Events.LEVEL_SWITCHED, sync);
  };
}
