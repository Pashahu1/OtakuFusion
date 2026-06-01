'use client';

import { useEffect, useRef, useMemo } from 'react';
import Artplayer from 'artplayer';

import { useArtplayerEpisodeLifecycle } from './useArtplayerEpisodeLifecycle';
import { useArtplayerLanguageMenu } from './useArtplayerLanguageMenu';
import { destroyArtplayerInstance, readPlayerDeferStrictInit } from './useArtplayerHls';
import { buildArtplayerStreamBootKey } from './artplayer-instance/buildArtplayerStreamBootKey';
import { mountArtplayerInstance } from './artplayer-instance/mountArtplayerInstance';
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

  const streamBootKey = useMemo(
    () =>
      buildArtplayerStreamBootKey({
        watchStreamProvider,
        streamUrl,
        thumbnail,
        subtitles,
        streamInfo,
      }),
    [
      watchStreamProvider,
      streamUrl,
      thumbnail,
      subtitles,
      streamInfo,
    ],
  );

  const { syncLanguageMenuIfReady } = useArtplayerLanguageMenu({
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

      const mounted = mountArtplayerInstance({
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
        isEffectActive: () => effectActive,
      });

      createdPlayer = mounted.art;
      clearSurfaceReady = mounted.clearSurfaceReady;
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
