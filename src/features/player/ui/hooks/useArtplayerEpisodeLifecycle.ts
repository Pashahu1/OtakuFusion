import { useEffect, useRef, useCallback } from 'react';
import type Artplayer from 'artplayer';

import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import type { PlayerProps } from '@/shared/types/PlayerTypes';

const PLAYBACK_SURFACE_READY_TIMEOUT_MS = 7200;

export interface UseArtplayerEpisodeLifecycleParams {
  episodeId: PlayerProps['episodeId'];
  episodes: PlayerProps['episodes'];
  currentEpisodeIndex: number;
  playNext: PlayerProps['playNext'];
  onEpisodeWatched: PlayerProps['onEpisodeWatched'];
  onPlaybackSurfaceReady: PlayerProps['onPlaybackSurfaceReady'];
  animeInfo: PlayerProps['animeInfo'];
}

export interface PlaybackSurfaceReadySession {
  clear: () => void;
}

/**
 * Episode end (play next), surface-ready, and userPaused for Artplayer.
 */
export function useArtplayerEpisodeLifecycle({
  episodeId,
  episodes,
  currentEpisodeIndex,
  playNext,
  onEpisodeWatched,
  onPlaybackSurfaceReady,
  animeInfo,
}: UseArtplayerEpisodeLifecycleParams) {
  const userPausedRef = useRef(false);
  const hasTriggeredNextRef = useRef(false);

  const episodeIdRef = useRef(episodeId);
  const episodesRef = useRef(episodes);
  const currentEpisodeIndexRef = useRef(currentEpisodeIndex);
  const playNextPropRef = useRef(playNext);
  const onEpisodeWatchedRef = useRef(onEpisodeWatched);
  const onPlaybackSurfaceReadyRef = useRef(onPlaybackSurfaceReady);
  const animeInfoRef = useRef(animeInfo);

  useEffect(() => {
    episodeIdRef.current = episodeId;
    episodesRef.current = episodes;
    currentEpisodeIndexRef.current = currentEpisodeIndex;
    playNextPropRef.current = playNext;
    onEpisodeWatchedRef.current = onEpisodeWatched;
    onPlaybackSurfaceReadyRef.current = onPlaybackSurfaceReady;
    animeInfoRef.current = animeInfo;
  });

  useEffect(() => {
    hasTriggeredNextRef.current = false;
    userPausedRef.current = false;
  }, [episodeId, episodes]);

  const attachEpisodeEndedHandler = useCallback((art: Artplayer) => {
    art.on('video:ended', () => {
      const id = episodeIdRef.current;
      const list = episodesRef.current;
      const idx = currentEpisodeIndexRef.current ?? -1;
      const epId = id != null ? String(id) : '';
      if (epId) onEpisodeWatchedRef.current?.(epId);

      if (hasTriggeredNextRef.current) return;

      const next = list?.[idx + 1];

      if (next) {
        const nextId = getEpisodeNumberFromId(next.id);
        if (nextId) {
          hasTriggeredNextRef.current = true;
          playNextPropRef.current(nextId);
        }
      }
    });
  }, []);

  const attachPlaybackSurfaceOnReady = useCallback((art: Artplayer): PlaybackSurfaceReadySession => {
    let surfaceReadyTimer: number | null = null;
    let surfaceReported = false;

    const reportSurfaceOnce = () => {
      if (surfaceReported) return;
      surfaceReported = true;
      if (surfaceReadyTimer != null) {
        window.clearTimeout(surfaceReadyTimer);
        surfaceReadyTimer = null;
      }
      queueMicrotask(() => {
        onPlaybackSurfaceReadyRef.current?.();
      });
    };

    art.once('video:playing', reportSurfaceOnce);
    art.once('video:canplaythrough', reportSurfaceOnce);
    art.once('video:loadedmetadata', reportSurfaceOnce);
    surfaceReadyTimer = window.setTimeout(reportSurfaceOnce, PLAYBACK_SURFACE_READY_TIMEOUT_MS);

    return {
      clear: () => {
        if (surfaceReadyTimer != null) {
          window.clearTimeout(surfaceReadyTimer);
          surfaceReadyTimer = null;
        }
      },
    };
  }, []);

  return {
    userPausedRef,
    attachEpisodeEndedHandler,
    attachPlaybackSurfaceOnReady,
  };
}
