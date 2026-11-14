'use client';

import { useRef, useCallback, useEffect } from 'react';

import type { WatchPlaybackAudio } from '@/features/watch/lib/playback-audio';
import { playbackAudioToStreamLang } from '@/features/watch/lib/playback-audio';
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
  playbackAudio: WatchPlaybackAudio;
}

/**
 * Update continue watching after player ready; refs avoid unnecessary remounts.
 */
export function useArtplayerContinueWatching({
  animeInfo,
  episodeId,
  episodeNum,
  watchStreamProvider,
  playbackAudio,
}: UseArtplayerContinueWatchingParams) {
  const animeInfoRef = useRef(animeInfo);
  const episodeIdRef = useRef(episodeId);
  const episodeNumRef = useRef(episodeNum);
  const watchStreamProviderRef = useRef(watchStreamProvider);
  const playbackAudioRef = useRef(playbackAudio);

  useEffect(() => {
    animeInfoRef.current = animeInfo;
    episodeIdRef.current = episodeId;
    episodeNumRef.current = episodeNum;
    watchStreamProviderRef.current = watchStreamProvider;
    playbackAudioRef.current = playbackAudio;
  });

  const playbackContext = useCallback((): ContinueWatchingPlaybackContext => {
    const audio = playbackAudioRef.current;
    return {
      watchStreamProvider: watchStreamProviderRef.current,
      streamLang: playbackAudioToStreamLang(audio),
      playbackAudio: audio,
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
