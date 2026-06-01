import { useEffect, useRef } from 'react';

import {
  episodeMatchesSelection,
  getEpisodeNumberFromId,
} from '@/shared/utils/episodeUtils';

import type { WatchAnimeState } from './useWatchAnimeState';

interface UseWatchAnimeInitialEpisodeSyncParams {
  animeId: string;
  initialEpisodeId: string | undefined;
  state: Pick<WatchAnimeState, 'episodes' | 'animeInfoLoading' | 'setEpisodeId'>;
}

/**
 * Apply URL `?ep=` when the query param changes.
 * Does not fight in-flight user selection while the URL is still catching up.
 */
export function useWatchAnimeInitialEpisodeSync({
  animeId,
  initialEpisodeId,
  state,
}: UseWatchAnimeInitialEpisodeSyncParams) {
  const { episodes, animeInfoLoading, setEpisodeId } = state;
  const lastAppliedUrlEpRef = useRef<string | undefined>(undefined);
  const lastAnimeIdRef = useRef(animeId);

  useEffect(() => {
    if (lastAnimeIdRef.current !== animeId) {
      lastAnimeIdRef.current = animeId;
      lastAppliedUrlEpRef.current = undefined;
    }
  }, [animeId]);

  useEffect(() => {
    if (!animeId.trim() || animeInfoLoading || !episodes?.length) return;

    const urlEp = initialEpisodeId?.trim();
    if (!urlEp) return;
    if (lastAppliedUrlEpRef.current === urlEp) return;

    const match = episodes.find((ep) => episodeMatchesSelection(ep, urlEp));
    if (!match) return;

    lastAppliedUrlEpRef.current = urlEp;
    const resolved = getEpisodeNumberFromId(match.id) ?? String(match.episode_no);
    setEpisodeId(resolved);
  }, [animeId, initialEpisodeId, episodes, animeInfoLoading, setEpisodeId]);
}
