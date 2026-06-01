import artplayerPluginHlsControl from 'artplayer-plugin-hls-control';
import type Artplayer from 'artplayer';
import type Hls from 'hls.js';
import { artplayerPluginUploadSubtitle } from './artplayerPluginUploadSubtitle';
import artplayerPluginChapter from './artPlayerPluginChapter';
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
import { urlLooksLikeHlsStream } from '@/lib/streamMediaType';
import { getPlayerLayers } from './getPlayerLayers';

export function getArtplayerOptions(
  userPausedRef: React.RefObject<boolean>,
  onM3u8HlsInstance?: (hls: InstanceType<typeof Hls>, art: Artplayer) => void,
  onM3u8HlsBeforeLoad?: (hls: InstanceType<typeof Hls>) => void,
  useManualStreamQuality?: boolean,
) {
  return {
    plugins: [
      artplayerPluginHlsControl({
        quality: {
          control: !useManualStreamQuality,
          setting: false,
          getName: (level: { height?: number }) => {
            const h = level?.height ?? 0;
            return h > 0 ? `${h}p` : 'Auto';
          },
          title: 'Quality',
          auto: 'Auto',
        },
      }),
      artplayerPluginUploadSubtitle(),
      artplayerPluginChapter({
        chapters: [],
      }),
    ],
    subtitle: {
      style: SUBTITLE_DEFAULT_STYLE,
      escape: false,
    },
    layers: getPlayerLayers(userPausedRef),
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
      m3u8(
        video: HTMLVideoElement,
        url: string,
        art: Artplayer
      ) {
        playM3u8(video, url, art, {
          onHlsBeforeLoad: onM3u8HlsBeforeLoad,
          onHlsInstance: (hls) => onM3u8HlsInstance?.(hls, art),
        });
      },
      mp4(video: HTMLVideoElement, url: string, art: Artplayer) {
        if (urlLooksLikeHlsStream(url)) {
          playM3u8(video, url, art, {
            onHlsBeforeLoad: onM3u8HlsBeforeLoad,
            onHlsInstance: (hls) => onM3u8HlsInstance?.(hls, art),
          });
          return;
        }
        if (art.hls) {
          art.hls.destroy();
          art.hls = null;
        }
        video.src = url;
      },
    },
  };
}
