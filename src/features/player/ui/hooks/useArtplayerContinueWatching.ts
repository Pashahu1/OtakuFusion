import { useEffect, useRef, useCallback } from 'react';

import { updateContinueWatching } from '../updateContinueWatching';
import type { PlayerProps } from '@/shared/types/PlayerTypes';

export interface UseArtplayerContinueWatchingParams {
  animeInfo: PlayerProps['animeInfo'];
  episodeId: PlayerProps['episodeId'];
  episodeNum: PlayerProps['episodeNum'];
}

/**
 * Update continue watching after player ready; refs avoid unnecessary remounts.
 */
export function useArtplayerContinueWatching({
  animeInfo,
  episodeId,
  episodeNum,
}: UseArtplayerContinueWatchingParams) {
  const animeInfoRef = useRef(animeInfo);
  const episodeIdRef = useRef(episodeId);
  const episodeNumRef = useRef(episodeNum);

  useEffect(() => {
    animeInfoRef.current = animeInfo;
    episodeIdRef.current = episodeId;
    episodeNumRef.current = episodeNum;
  });

  const scheduleContinueWatchingUpdate = useCallback(() => {
    queueMicrotask(() => {
      updateContinueWatching(
        animeInfoRef.current,
        episodeIdRef.current,
        episodeNumRef.current
      );
    });
  }, []);

  return { scheduleContinueWatchingUpdate };
}
