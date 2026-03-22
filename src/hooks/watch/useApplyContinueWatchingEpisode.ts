import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { useEffect } from 'react';

export function useApplyContinueWatchingEpisode(
  urlEp: string | undefined,
  episodes: EpisodesTypes[] | null,
  hasAppliedSavedEpisodeRef: React.RefObject<boolean>,
  animeId: string,
  setEpisodeId: (item: string) => void
) {
  useEffect(() => {
    if (urlEp || !episodes?.length || hasAppliedSavedEpisodeRef.current) return;
    if (typeof window === 'undefined') return;
    hasAppliedSavedEpisodeRef.current = true;
    try {
      const cw = JSON.parse(localStorage.getItem('continueWatching') || '[]');
      const found = cw.find((x: { id: string }) => x.id === animeId);
      const savedId = found?.episodeId;
      if (
        savedId &&
        episodes.some((ep) => getEpisodeNumberFromId(ep.id) === savedId)
      ) {
        setEpisodeId(savedId);
      }
    } catch {
      console.error('Error parsing continue watching data');
      return;
    }
  }, [animeId, episodes, setEpisodeId, urlEp]);
}
