'use client';

import { useEffect, useRef, useMemo } from 'react';
import Artplayer from 'artplayer';

import { PLAYER_THEME_COLOR } from '../playerConstants';
import { getStreamFullUrl, getStreamHeaders } from '../playerStream';
import { urlLooksLikeHlsStream } from '@/lib/streamMediaType';
import { getArtplayerOptions } from '../getArtplayerOptions';
import { setupPlayerReady } from '../setupPlayerReady';
import { attachStreamQualityMenu } from '../attachStreamQualityMenu';
import { useArtplayerEpisodeLifecycle } from './useArtplayerEpisodeLifecycle';
import { useArtplayerLanguageMenu } from './useArtplayerLanguageMenu';
import {
  buildArtplayerHlsRuntime,
  createArtplayerVideoErrorReporter,
  destroyArtplayerInstance,
  inferArtplayerMediaType,
  readPlayerDeferStrictInit,
} from './useArtplayerHls';
import { attachArtplayerSkipSegmentsOnReady } from './useArtplayerSkipSegments';
import { attachArtplayerSubtitleResize } from './useArtplayerSubtitleResize';
import type { UseArtplayerInstanceParams } from './useArtplayerInstanceTypes';

export type { UseArtplayerInstanceParams } from './useArtplayerInstanceTypes';

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

/**
 * Facade: compound hooks + single mount effect for Artplayer.
 * Remount only on `streamBootKey`; episode/callbacks via refs in sub-hooks.
 */
export function useArtplayerInstance({
  streamUrl,
  subtitles,
  thumbnail,
  episodeId,
  episodes,
  currentEpisodeIndex,
  playNext,
  onEpisodeWatched,
  animeInfo,
  episodeNum,
  streamInfo,
  servers,
  activeServerId,
  setActiveServerId,
  watchStreamProvider,
  setWatchStreamProvider,
  onPlaybackError,
  onPlaybackSurfaceReady,
  anilibertyLanguageMenuEligible,
  hikkaLanguageMenuEligible,
}: UseArtplayerInstanceParams) {
  const artRef = useRef<HTMLDivElement>(null);
  const artInstanceRef = useRef<Artplayer | null>(null);
  const onPlaybackErrorRef = useRef(onPlaybackError);

  useEffect(() => {
    onPlaybackErrorRef.current = onPlaybackError;
  });

  const streamBootKey = useMemo(() => {
    const subKey = (subtitles ?? [])
      .map(
        (s) =>
          `${String(s.file ?? '').trim()}\t${String(s.label ?? '').trim()}`
      )
      .join('\n');
    const seg = streamInfo?.skipSegments;
    const qv = streamInfo?.qualityVariants;
    const qvKey = qv?.length
      ? qv.map((q) => `${q.height}:${q.url}`).join('|')
      : '';
    const segKey = seg
      ? [
          seg.intro ? `${seg.intro.start}-${seg.intro.end}` : '',
          seg.outro ? `${seg.outro.start}-${seg.outro.end}` : '',
        ].join('|')
      : '';
    return [watchStreamProvider, streamUrl, thumbnail ?? '', subKey, segKey, qvKey].join('\f');
  }, [
    watchStreamProvider,
    streamUrl,
    thumbnail,
    subtitles,
    streamInfo?.skipSegments,
    streamInfo?.qualityVariants,
  ]);

  const { anilibertyEligibleRef, hikkaEligibleRef, syncLanguageMenuIfReady } =
    useArtplayerLanguageMenu({
      artInstanceRef,
      servers,
      activeServerId,
      setActiveServerId,
      watchStreamProvider,
      setWatchStreamProvider,
      anilibertyLanguageMenuEligible,
      hikkaLanguageMenuEligible,
    });

  const {
    userPausedRef,
    attachEpisodeEndedHandler,
    attachPlaybackSurfaceOnReady,
  } = useArtplayerEpisodeLifecycle({
    episodeId,
    episodes,
    currentEpisodeIndex,
    playNext,
    onEpisodeWatched,
    onPlaybackSurfaceReady,
    animeInfo,
  });

  useEffect(() => {
    if (!streamUrl || !artRef.current) return;

    let effectActive = true;
    let initTimer: number | null = null;
    let clearSurfaceReady: (() => void) | null = null;
    let suppressPlaybackError = false;
    let createdPlayer: Artplayer | undefined;

    const deferStrictInit = readPlayerDeferStrictInit();
    const container = artRef.current;

    if (artInstanceRef.current) {
      destroyArtplayerInstance(artInstanceRef.current, container);
      artInstanceRef.current = null;
    }

    container.innerHTML = '';

    const runPlayerInit = (): void => {
      if (!effectActive || !artRef.current) return;

      const headers = getStreamHeaders(streamInfo, streamUrl);
      const fullURL = getStreamFullUrl(streamUrl, headers);
      const looksHls =
        urlLooksLikeHlsStream(streamUrl) || urlLooksLikeHlsStream(fullURL);
      const playerMediaType = inferArtplayerMediaType(streamUrl, streamInfo, fullURL);
      const useHlsPlayback = looksHls;
      const useManualStreamQuality = Boolean(
        streamInfo?.qualityVariants && streamInfo.qualityVariants.length > 1
      );

      suppressPlaybackError = false;

      const hlsRuntime = buildArtplayerHlsRuntime({
        effectActive: () => effectActive,
        suppressPlaybackError: () => suppressPlaybackError,
        onPlaybackError: () => onPlaybackErrorRef.current?.(),
        useManualStreamQuality,
      });

      const art = new Artplayer({
        container,
        url: fullURL,
        type: playerMediaType,
        autoplay: false,
        volume: 1,
        setting: true,
        playbackRate: true,
        pip: true,
        hotkey: false,
        fullscreen: true,
        mutex: true,
        playsInline: true,
        lock: false,
        airplay: true,
        autoOrientation: true,
        fastForward: true,
        aspectRatio: true,
        subtitleOffset: true,
        theme: PLAYER_THEME_COLOR,
        ...getArtplayerOptions(
          userPausedRef,
          (hls, player) => hlsRuntime.onM3u8HlsInstance(hls, player),
          hlsRuntime.onM3u8HlsBeforeLoad,
          useManualStreamQuality
        ),
      });

      if (useHlsPlayback) {
        hlsRuntime.bootHlsPlayback(art, fullURL);
      }

      createArtplayerVideoErrorReporter(art, {
        effectActive: () => effectActive,
        suppressPlaybackError: () => suppressPlaybackError,
        reportError: () => {
          if (!effectActive || suppressPlaybackError) return;
          hlsRuntime.reportFatalPlaybackError(art);
        },
      });

      attachArtplayerSubtitleResize(art);
      attachEpisodeEndedHandler(art);

      art.on('ready', () => {
        const rawLang = streamInfo?.streamingLink?.[0]?.type;
        const streamLang =
          rawLang === 'dub' || rawLang === 'sub' ? rawLang : null;
        setupPlayerReady(
          art,
          thumbnail,
          userPausedRef,
          artRef,
          subtitles,
          streamLang,
          streamInfo?.skipSegments,
          streamInfo,
          streamUrl
        );
        syncLanguageMenuIfReady();
        attachStreamQualityMenu(art, streamInfo ?? null, streamUrl);
        attachArtplayerSkipSegmentsOnReady(art, streamInfo?.skipSegments);
        hlsRuntime.attachQualityPersistenceOnReady(art);
        clearSurfaceReady = attachPlaybackSurfaceOnReady(art).clear;
      });

      artInstanceRef.current = art;
      createdPlayer = art;
    };

    if (deferStrictInit) {
      initTimer = window.setTimeout(() => {
        initTimer = null;
        runPlayerInit();
      }, 0);
    } else {
      runPlayerInit();
    }

    return () => {
      effectActive = false;
      suppressPlaybackError = true;
      if (initTimer != null) {
        window.clearTimeout(initTimer);
        initTimer = null;
      }
      clearSurfaceReady?.();
      clearSurfaceReady = null;
      const instanceToDestroy =
        createdPlayer && artInstanceRef.current === createdPlayer
          ? createdPlayer
          : null;
      if (instanceToDestroy) {
        artInstanceRef.current = null;
        destroyArtplayerInstance(instanceToDestroy, container);
      }
    };
  }, [
    streamBootKey,
    syncLanguageMenuIfReady,
    attachEpisodeEndedHandler,
    attachPlaybackSurfaceOnReady,
  ]);

  return { artRef };
}
