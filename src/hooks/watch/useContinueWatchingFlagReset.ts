import { useEffect } from 'react';

export const useContinueWatchingFlagReset = (
  hasAppliedSavedEpisodeRef: React.RefObject<boolean>,
  animeId: string
) => {
  useEffect(() => {
    hasAppliedSavedEpisodeRef.current = false;
  }, [animeId]);
};
