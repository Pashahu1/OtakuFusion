'use client';

import { useRef, useCallback, useEffect } from 'react';

import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import {
  updateContinueWatching,
  type ContinueWatchingProgress,
  type ContinueWatchingPlaybackContext,
} from '../updateContinueWatching';
import type { PlayerProps } from '@/shared/types/PlayerTypes';

export interface UseArtplayerContinueWatchingParams {
  animeInfo: PlayerProps['animeInfo'];
  episodeId: PlayerProps['episodeId'];
  episodeNum: PlayerProps['episodeNum'];
  watchStreamProvider: WatchStreamProvider;
  streamLang: 'sub' | 'dub';
}

/**
 * Update continue watching after player ready; refs avoid unnecessary remounts.
 */
export function useArtplayerContinueWatching({
  animeInfo,
  episodeId,
  episodeNum,
  watchStreamProvider,
  streamLang,
}: UseArtplayerContinueWatchingParams) {
  const animeInfoRef = useRef(animeInfo);
  const episodeIdRef = useRef(episodeId);
  const episodeNumRef = useRef(episodeNum);
  const watchStreamProviderRef = useRef(watchStreamProvider);
  const streamLangRef = useRef(streamLang);

  useEffect(() => {
    animeInfoRef.current = animeInfo;
    episodeIdRef.current = episodeId;
    episodeNumRef.current = episodeNum;
    watchStreamProviderRef.current = watchStreamProvider;
    streamLangRef.current = streamLang;
  });

  const playbackContext = useCallback((): ContinueWatchingPlaybackContext => {
    return {
      watchStreamProvider: watchStreamProviderRef.current,
      streamLang: streamLangRef.current,
    };
  }, []);

  const scheduleContinueWatchingUpdate = useCallback(
    (progress?: ContinueWatchingProgress, playback?: ContinueWatchingPlaybackContext) => {
      queueMicrotask(() => {
        updateContinueWatching(
          animeInfoRef.current,
          episodeIdRef.current,
          episodeNumRef.current,
          progress,
          playback ?? playbackContext(),
        );
      });
    },
    [playbackContext],
  );

  return { scheduleContinueWatchingUpdate };
}
