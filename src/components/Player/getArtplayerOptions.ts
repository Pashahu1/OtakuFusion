import artplayerPluginHlsControl from 'artplayer-plugin-hls-control';
import { artplayerPluginUploadSubtitle } from './artplayerPluginUploadSubtitle';
import artplayerPluginChapter from './artPlayerPluinChaper';
import { createChapters } from './playerChapters';
import { SUBTITLE_DEFAULT_STYLE } from './playerConstants';

import {
  fullScreenOffIcon,
  fullScreenOnIcon,
  loadingIcon,
  muteIcon,
  pauseIcon,
  pipIcon,
  playIcon,
  playIconLg,
  settingsIcon,
  volumeIcon,
} from './PlayerIcons';
import { playM3u8 } from './playerStream';
import type { Segment } from '@/shared/types/VideoSegmentsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { getPlayerLayers } from './getPlayerLayers';

export function getArtplayerOptions(
  intro: Segment | null,
  outro: Segment | null,
  currentEpisodeIndex: number,
  episodes: EpisodesTypes[],
  playNext: (episodeId: string) => void,
  userPausedRef: React.RefObject<boolean>
) {
  return {
    plugins: [
      artplayerPluginHlsControl({
        quality: {
          setting: true,
          getName: (level: { height?: number }) =>
            String(level?.height ?? '') + 'P',
          title: 'Quality',
          auto: 'Auto',
        },
      }),
      artplayerPluginUploadSubtitle(),
      artplayerPluginChapter({
        chapters: createChapters(intro, outro),
      }),
    ],
    subtitle: {
      style: SUBTITLE_DEFAULT_STYLE,
      escape: false,
    },
    layers: getPlayerLayers(
      currentEpisodeIndex,
      episodes,
      playNext,
      userPausedRef,
      intro,
      outro,
    ),
    icons: {
      play: playIcon,
      pause: pauseIcon,
      setting: settingsIcon,
      volume: volumeIcon,
      pip: pipIcon,
      volumeClose: muteIcon,
      state: playIconLg,
      loading: loadingIcon,
      fullscreenOn: fullScreenOnIcon,
      fullscreenOff: fullScreenOffIcon,
    },
    customType: {
      m3u8: playM3u8,
    },
  };
}
