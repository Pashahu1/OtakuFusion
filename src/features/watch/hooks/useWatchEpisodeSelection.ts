import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import {
  episodeMatchesSelection,
  getEpisodeNumberFromId,
} from '@/shared/utils/episodeUtils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useWatchEpisodeSelection(
  episodes: EpisodesTypes[] | null,
  episodeId: string | null,
  animeId: string,
  urlEp: string | undefined,
  setEpisodeId: (item: string) => void
) {
  const router = useRouter();
  useEffect(() => {
    if (!episodes || episodes.length === 0) return;

    const isValidEpisode = episodes.some((ep) =>
      episodeMatchesSelection(ep, episodeId)
    );

    if (!episodeId || !isValidEpisode) {
      const preserveNum = episodeId ? Number(episodeId) : NaN;
      if (Number.isFinite(preserveNum) && preserveNum > 0) {
        const byNo = episodes.find((ep) => ep.episode_no === preserveNum);
        if (byNo) {
          const remapped =
            getEpisodeNumberFromId(byNo.id) ?? String(byNo.episode_no);
          if (remapped !== episodeId) {
            setEpisodeId(remapped);
          }
          return;
        }
      }

      const fallbackId = getEpisodeNumberFromId(episodes[0].id);
      if (fallbackId && fallbackId !== episodeId) {
        setEpisodeId(fallbackId);
      }
      return;
    }

    const urlEpTrim = urlEp?.trim();
    if (urlEpTrim === episodeId) return;

    const newUrl = `/watch/${animeId}?ep=${episodeId}`;
    router.replace(newUrl, { scroll: false });
  }, [episodeId, animeId, router, episodes, setEpisodeId, urlEp]);
}
