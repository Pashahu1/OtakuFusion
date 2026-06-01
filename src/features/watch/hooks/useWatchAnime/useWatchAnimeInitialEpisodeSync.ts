import { useEffect } from 'react';

import { episodeMatchesSelection } from '@/shared/utils/episodeUtils';

import type { WatchAnimeState } from './useWatchAnimeState';

interface UseWatchAnimeInitialEpisodeSyncParams {
  animeId: string;
  initialEpisodeId: string | undefined;
  state: Pick<
    WatchAnimeState,
    'episodes' | 'episodeId' | 'animeInfoLoading' | 'setEpisodeId'
  >;
}

/** Align selected episode with URL `?ep=` once catalog is ready. */
export function useWatchAnimeInitialEpisodeSync({
  animeId,
  initialEpisodeId,
  state,
}: UseWatchAnimeInitialEpisodeSyncParams) {
  const { episodes, episodeId, animeInfoLoading, setEpisodeId } = state;

  useEffect(() => {
    if (!animeId.trim() || animeInfoLoading || !episodes?.length) return;
    if (!initialEpisodeId) return;
    if (!episodes.some((ep) => episodeMatchesSelection(ep, initialEpisodeId))) return;

    if (episodeId != null) {
      const currentEpisode = episodes.find((ep) => episodeMatchesSelection(ep, episodeId));
      if (currentEpisode && episodeMatchesSelection(currentEpisode, initialEpisodeId)) {
        return;
      }
    }

    setEpisodeId(initialEpisodeId);
  }, [animeId, initialEpisodeId, episodes, animeInfoLoading, episodeId, setEpisodeId]);
}
