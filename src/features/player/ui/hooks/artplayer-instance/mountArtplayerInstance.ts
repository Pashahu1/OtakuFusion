import Artplayer from 'artplayer';

import { PLAYER_THEME_COLOR } from '../../playerConstants';
import { getStreamFullUrl, getStreamHeaders } from '../../playerStream';
import { getArtplayerOptions } from '../../getArtplayerOptions';
import { setupPlayerReady } from '../../setupPlayerReady';
import { attachStreamQualityMenu } from '../../attachStreamQualityMenu';
import {
  buildArtplayerHlsRuntime,
  createArtplayerVideoErrorReporter,
  inferArtplayerMediaType,
} from '../useArtplayerHls';
import { attachArtplayerSkipSegmentsOnReady } from '../useArtplayerSkipSegments';
import { attachArtplayerSubtitleResize } from '../useArtplayerSubtitleResize';
import { formatNowPlayingEpisode } from '../../player-layers/nowPlayingLayer';
import { attachNowPlayingOverlay } from '../../player-ready/attachNowPlayingOverlay';
import type { UseArtplayerInstanceParams } from '../useArtplayerInstanceTypes';

export interface MountArtplayerInstanceParams {
  container: HTMLDivElement;
  streamUrl: string;
  streamInfo: UseArtplayerInstanceParams['streamInfo'];
  subtitles: UseArtplayerInstanceParams['subtitles'];
  thumbnail: UseArtplayerInstanceParams['thumbnail'];
  userPausedRef: React.MutableRefObject<boolean>;
  artRef: React.RefObject<HTMLDivElement | null>;
  onPlaybackErrorRef: React.MutableRefObject<(() => void) | undefined>;
  syncLanguageMenuIfReady: () => void;
  attachEpisodeEndedHandler: (art: Artplayer) => void;
  attachPlaybackSurfaceOnReady: (art: Artplayer) => { clear: () => void };
  artInstanceRef: React.MutableRefObject<Artplayer | null>;
  isEffectActive: () => boolean;
  scheduleContinueWatchingUpdate?: () => void;
  attachPlaybackProgressHandlers?: (art: Artplayer) => void;
  resumeTargetSeconds?: number;
  animeTitle?: string | null;
  episodeNum?: number | null;
  episodeTitle?: string | null;
}

export interface MountArtplayerInstanceResult {
  art: Artplayer;
  clearSurfaceReady: () => void;
}

export function mountArtplayerInstance({
  container,
  streamUrl,
  streamInfo,
  subtitles,
  thumbnail,
  userPausedRef,
  artRef,
  onPlaybackErrorRef,
  syncLanguageMenuIfReady,
  attachEpisodeEndedHandler,
  attachPlaybackSurfaceOnReady,
  artInstanceRef,
  isEffectActive,
  scheduleContinueWatchingUpdate,
  attachPlaybackProgressHandlers,
  resumeTargetSeconds,
  animeTitle,
  episodeNum,
  episodeTitle,
}: MountArtplayerInstanceParams): MountArtplayerInstanceResult {
  let suppressPlaybackError = false;
  let clearSurfaceReady: (() => void) | null = null;

  const headers = getStreamHeaders(streamInfo, streamUrl);
  const fullURL = getStreamFullUrl(streamUrl, headers);
  const playerMediaType = inferArtplayerMediaType(streamUrl, streamInfo, fullURL);
  const useManualStreamQuality = Boolean(
    streamInfo?.qualityVariants && streamInfo.qualityVariants.length > 1,
  );

  const hlsRuntime = buildArtplayerHlsRuntime({
    effectActive: isEffectActive,
    suppressPlaybackError: () => suppressPlaybackError,
    onPlaybackError: () => onPlaybackErrorRef.current?.(),
    useManualStreamQuality,
  });

  const art = new Artplayer({
    container,
    url: fullURL,
    type: playerMediaType,
    autoplay: true,
    miniProgressBar: false,
    volume: 1,
    setting: false,
    playbackRate: false,
    pip: false,
    hotkey: false,
    fullscreen: true,
    mutex: true,
    playsInline: true,
    lock: false,
    airplay: true,
    autoOrientation: true,
    fastForward: true,
    aspectRatio: false,
    subtitleOffset: false,
    theme: PLAYER_THEME_COLOR,
    ...getArtplayerOptions(
      userPausedRef,
      (hls, player) => hlsRuntime.onM3u8HlsInstance(hls, player),
      hlsRuntime.onM3u8HlsBeforeLoad,
      useManualStreamQuality,
    ),
  });

  createArtplayerVideoErrorReporter(art, {
    effectActive: isEffectActive,
    suppressPlaybackError: () => suppressPlaybackError,
    reportError: () => {
      if (!isEffectActive() || suppressPlaybackError) return;
      hlsRuntime.reportFatalPlaybackError(art);
    },
  });

  attachArtplayerSubtitleResize(art);
  attachEpisodeEndedHandler(art);

  art.on('ready', () => {
    const rawLang = streamInfo?.streamingLink?.[0]?.type;
    const streamLang = rawLang === 'dub' || rawLang === 'sub' ? rawLang : null;
    setupPlayerReady(
      art,
      thumbnail,
      userPausedRef,
      artRef,
      subtitles,
      streamLang,
      streamInfo?.skipSegments,
      streamInfo,
      streamUrl,
      resumeTargetSeconds,
    );
    attachNowPlayingOverlay(art, {
      title: animeTitle?.trim() ?? '',
      episodeLabel: formatNowPlayingEpisode(episodeNum, episodeTitle),
    });
    syncLanguageMenuIfReady();
    attachStreamQualityMenu(art, streamInfo ?? null, streamUrl);
    attachArtplayerSkipSegmentsOnReady(art, streamInfo?.skipSegments);
    hlsRuntime.attachQualityPersistenceOnReady(art);
    scheduleContinueWatchingUpdate?.();
    attachPlaybackProgressHandlers?.(art);
    clearSurfaceReady = attachPlaybackSurfaceOnReady(art).clear;
  });

  artInstanceRef.current = art;

  return {
    art,
    clearSurfaceReady: () => {
      suppressPlaybackError = true;
      clearSurfaceReady?.();
      clearSurfaceReady = null;
    },
  };
}
