'use client';

import { useCallback, useEffect, useMemo, useLayoutEffect, useRef } from 'react';
import Artplayer from 'artplayer';

import { useArtplayerContinueWatching } from './useArtplayerContinueWatching';
import { useArtplayerPlaybackProgress } from './useArtplayerPlaybackProgress';
import { useArtplayerEpisodeLifecycle } from './useArtplayerEpisodeLifecycle';
import { useArtplayerLanguageMenu } from './useArtplayerLanguageMenu';
import { findContinueWatchingEntry } from '@/features/watch/lib/resolve-continue-watching-cta';
import { readContinueWatchingList } from '@/features/watch/lib/continue-watching-list';
import { continueWatchingEpisodeParam } from '@/features/watch/lib/continue-watching-display';
import { peekPendingPlaybackResume } from '@/features/watch/lib/playback-resume-pending';
import { isWatchDubServerId } from '@/shared/data/servers';
import { normalizeEpisodeStorageKey } from '@/shared/utils/episodeUtils';
import { destroyArtplayerInstance, readPlayerDeferStrictInit } from './useArtplayerHls';
import { buildArtplayerStreamBootKey } from './artplayer-instance/buildArtplayerStreamBootKey';
import { mountArtplayerInstance } from './artplayer-instance/mountArtplayerInstance';
import type { UseArtplayerInstanceParams } from './useArtplayerInstanceTypes';
import type { ContinueWatchingProgress } from '../updateContinueWatching';

export type { UseArtplayerInstanceParams } from './useArtplayerInstanceTypes';

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

/**
 * Facade: compound hooks + single mount effect for Artplayer.
 * Remount only on `streamBootKey`; episode/callbacks via refs in sub-hooks.
 */
export function useArtplayerInstance({
  localAnimeId,
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
  anikotoLanguageMenuEligible,
}: UseArtplayerInstanceParams) {
  const artRef = useRef<HTMLDivElement>(null);
  const artInstanceRef = useRef<Artplayer | null>(null);
  const onPlaybackErrorRef = useRef(onPlaybackError);

  useEffect(() => {
    onPlaybackErrorRef.current = onPlaybackError;
  });

  const streamLang: 'sub' | 'dub' = isWatchDubServerId(activeServerId) ? 'dub' : 'sub';

  const resolvedStreamLang = useMemo((): 'sub' | 'dub' | null => {
    const raw = streamInfo?.streamingLink?.[0]?.type;
    return raw === 'dub' || raw === 'sub' ? raw : null;
  }, [streamInfo]);

  const { scheduleContinueWatchingUpdate } = useArtplayerContinueWatching({
    animeInfo,
    episodeId,
    episodeNum,
    watchStreamProvider,
    streamLang,
  });

  const resumePositionSeconds = useMemo((): number | undefined => {
    const catalogId = localAnimeId.trim();
    const epKey = normalizeEpisodeStorageKey(episodeId, episodeNum);
    if (!catalogId || !epKey) return undefined;

    const pending = peekPendingPlaybackResume(catalogId, epKey);
    if (pending != null) return pending;

    const entry = findContinueWatchingEntry(
      readContinueWatchingList(),
      catalogId,
      animeInfo?.data_id,
    );
    if (entry?.positionSeconds == null) return undefined;
    const savedEp = continueWatchingEpisodeParam(entry);
    if (savedEp !== epKey) return undefined;
    return entry.positionSeconds;
  }, [localAnimeId, animeInfo?.data_id, episodeId, episodeNum]);

  const onLanguageSwitchResume = useCallback(
    (progress: ContinueWatchingProgress) => {
      scheduleContinueWatchingUpdate(progress);
    },
    [scheduleContinueWatchingUpdate],
  );

  const { attachPlaybackProgressHandlers } = useArtplayerPlaybackProgress({
    localAnimeId,
    episodeId,
    episodeNum,
    scheduleContinueWatchingUpdate,
    savedPositionSeconds: resumePositionSeconds,
    consumePendingOnResume: true,
  });

  const streamBootKey = useMemo(
    () =>
      buildArtplayerStreamBootKey({
        watchStreamProvider,
        episodeId,
        streamUrl,
        thumbnail,
        subtitles,
        streamInfo,
      }),
    [watchStreamProvider, episodeId, streamUrl, thumbnail, subtitles, streamInfo],
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
    anikotoLanguageMenuEligible,
    resolvedStreamLang,
    animeId: localAnimeId,
    episodeId,
    episodeNum,
    onLanguageSwitchResume,
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

  useLayoutEffect(() => {
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
        scheduleContinueWatchingUpdate,
        attachPlaybackProgressHandlers,
        resumeTargetSeconds: resumePositionSeconds,
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
      onPlaybackErrorRef.current = undefined;
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
    streamUrl,
    streamInfo,
    subtitles,
    thumbnail,
    resumePositionSeconds,
    userPausedRef,
    syncLanguageMenuIfReady,
    attachEpisodeEndedHandler,
    attachPlaybackSurfaceOnReady,
    scheduleContinueWatchingUpdate,
    attachPlaybackProgressHandlers,
  ]);

  return { artRef };
}
