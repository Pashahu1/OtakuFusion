import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useWatchEpisodeSelection(
  episodes: EpisodesTypes[] | null,
  episodeId: string | null,
  animeId: string,
  setEpisodeId: (item: string) => void,
  isFirstSetRef: React.RefObject<boolean>
) {
  const router = useRouter();
  useEffect(() => {
    if (!episodes || episodes.length === 0) return;

    const isValidEpisode = episodes.some(
      (ep) => getEpisodeNumberFromId(ep.id) === episodeId
    );

    if (!episodeId || !isValidEpisode) {
      const fallbackId = getEpisodeNumberFromId(episodes[0].id);
      if (fallbackId && fallbackId !== episodeId) {
        setEpisodeId(fallbackId);
      }
      return;
    }

    if (!isFirstSetRef.current) return;

    const newUrl = `/watch/${animeId}?ep=${episodeId}`;
    router.replace(newUrl);
    isFirstSetRef.current = false;
  }, [episodeId, animeId, router, episodes, setEpisodeId]);
}
