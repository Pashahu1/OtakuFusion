import artplayerPluginHlsControl from 'artplayer-plugin-hls-control';
import type Artplayer from 'artplayer';
import type Hls from 'hls.js';
import artplayerPluginChapter from './artPlayerPluginChapter';
import { SUBTITLE_DEFAULT_STYLE } from './playerConstants';

import {
  fullScreenOffIcon,
  fullScreenOnIcon,
  loadingIcon,
  muteIcon,
  pauseIcon,
  playIcon,
  playIconLg,
  volumeIcon,
} from './PlayerIcons';
import { playM3u8 } from './playerStream';
import { urlLooksLikeHlsStream } from '@/lib/streamMediaType';
import { ARTPLAYER_NETFLIX_CSS_VAR } from './player-chrome/artplayerCssVar';
import { getArtplayerSkipControls } from './player-skip/getArtplayerSkipControls';
import { getPlayerLayers } from './getPlayerLayers';
import { tStatic } from '@/i18n/t';
import { createArtplayerAnime4kPlugin } from './anime4k/createArtplayerAnime4kPlugin';

export function getArtplayerOptions(
  userPausedRef: React.RefObject<boolean>,
  onM3u8HlsInstance?: (hls: InstanceType<typeof Hls>, art: Artplayer) => void,
  onM3u8HlsBeforeLoad?: (hls: InstanceType<typeof Hls>) => void,
  _useManualStreamQuality?: boolean,
) {
  return {
    plugins: [
      artplayerPluginHlsControl({
        quality: {
          control: false,
          setting: false,
          getName: (level: { height?: number }) => {
            const h = level?.height ?? 0;
            return h > 0 ? `${h}p` : tStatic('player.auto');
          },
          title: tStatic('player.quality'),
          auto: tStatic('player.auto'),
        },
      }),
      artplayerPluginChapter({
        chapters: [],
      }),
      createArtplayerAnime4kPlugin(),
    ],
    subtitle: {
      style: SUBTITLE_DEFAULT_STYLE,
      escape: false,
    },
    layers: getPlayerLayers(userPausedRef),
    controls: getArtplayerSkipControls(),
    cssVar: ARTPLAYER_NETFLIX_CSS_VAR,
    moreVideoAttr: {
      controls: false,
      playsInline: true,
      crossOrigin: 'anonymous',
    },
    icons: {
      play: playIcon,
      pause: pauseIcon,
      volume: volumeIcon,
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
