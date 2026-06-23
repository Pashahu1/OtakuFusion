import { useEffect, useRef, useCallback } from 'react';
import type Artplayer from 'artplayer';

import {
  shouldMarkEpisodeWatched,
  shouldPromptUpNext,
} from '@/features/player/lib/episode-end-thresholds';
import { setArtplayerHasNextEpisode } from '@/features/player/lib/artplayer-near-end-state';
import { formatUpNextEpisodeLabel } from '@/features/player/lib/format-up-next-episode-label';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { removeFromContinueWatching } from '../updateContinueWatching';
import { attachUpNextOverlay } from '../player-ready/attachUpNextOverlay';
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
 * Episode end (play next), early watched mark, up-next prompt, surface-ready, and userPaused.
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
  const hasMarkedWatchedRef = useRef(false);

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
    hasMarkedWatchedRef.current = false;
    userPausedRef.current = false;
  }, [episodeId, episodes]);

  const attachEpisodeEndedHandler = useCallback((art: Artplayer) => {
    let upNextOverlay: ReturnType<typeof attachUpNextOverlay> | null = null;

    const markWatchedOnce = () => {
      const epId = episodeIdRef.current != null ? String(episodeIdRef.current) : '';
      if (!epId || hasMarkedWatchedRef.current) return;
      hasMarkedWatchedRef.current = true;
      onEpisodeWatchedRef.current?.(epId);
    };

    const triggerPlayNext = () => {
      if (hasTriggeredNextRef.current) return false;

      const list = episodesRef.current;
      const idx = currentEpisodeIndexRef.current ?? -1;
      const next = list?.[idx + 1];
      if (!next) return false;

      const nextId = getEpisodeNumberFromId(next.id);
      if (!nextId) return false;

      hasTriggeredNextRef.current = true;
      markWatchedOnce();
      playNextPropRef.current(nextId);
      return true;
    };

    const clearContinueWatchingIfSeriesComplete = () => {
      const list = episodesRef.current;
      const idx = currentEpisodeIndexRef.current ?? -1;
      const info = animeInfoRef.current;
      if (info?.id && info.data_id != null && list && list.length > 0 && idx >= 0) {
        removeFromContinueWatching(info.id, info.data_id);
      }
    };

    const syncNearEndPlayback = () => {
      const currentTime = art.currentTime;
      const duration = art.video?.duration ?? art.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      if (shouldMarkEpisodeWatched(currentTime, duration)) {
        markWatchedOnce();
      }

      const list = episodesRef.current;
      const idx = currentEpisodeIndexRef.current ?? -1;
      const next = list?.[idx + 1];
      const hasNextEpisode = Boolean(next);

      setArtplayerHasNextEpisode(art, hasNextEpisode);

      if (!hasNextEpisode || hasTriggeredNextRef.current) {
        upNextOverlay?.hide();
        return;
      }

      if (shouldPromptUpNext(currentTime, duration) && next) {
        upNextOverlay?.show(formatUpNextEpisodeLabel(next));
      } else {
        upNextOverlay?.hide();
      }
    };

    const onTimeUpdate = () => {
      syncNearEndPlayback();
    };

    const onEnded = () => {
      markWatchedOnce();
      upNextOverlay?.hide();

      if (hasTriggeredNextRef.current) return;

      const list = episodesRef.current;
      const idx = currentEpisodeIndexRef.current ?? -1;
      const next = list?.[idx + 1];

      if (next) {
        triggerPlayNext();
        return;
      }

      clearContinueWatchingIfSeriesComplete();
    };

    const onReady = () => {
      upNextOverlay = attachUpNextOverlay(art, () => {
        triggerPlayNext();
      });
    };

    const onDestroy = () => {
      upNextOverlay?.clear();
      upNextOverlay = null;
    };

    art.on('ready', onReady);
    art.on('video:timeupdate', onTimeUpdate);
    art.on('video:ended', onEnded);
    art.on('destroy', onDestroy);
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
