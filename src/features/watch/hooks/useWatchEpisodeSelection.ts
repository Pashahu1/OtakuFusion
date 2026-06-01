import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import {
  episodeMatchesSelection,
  getEpisodeNumberFromId,
} from '@/shared/utils/episodeUtils';
import { watchPlayPath } from '@/shared/utils/watch-routes';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function useWatchEpisodeSelection(
  episodes: EpisodesTypes[] | null,
  episodeId: string | null,
  animeId: string,
  urlEp: string | undefined,
  setEpisodeId: (item: string) => void,
) {
  const router = useRouter();
  const pendingUrlEpRef = useRef<string | null>(null);
  const lastAnimeIdRef = useRef(animeId);

  useEffect(() => {
    if (lastAnimeIdRef.current !== animeId) {
      lastAnimeIdRef.current = animeId;
      pendingUrlEpRef.current = null;
    }
  }, [animeId]);

  useEffect(() => {
    if (!episodes || episodes.length === 0) return;

    const isValidEpisode = episodes.some((ep) => episodeMatchesSelection(ep, episodeId));

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
    if (urlEpTrim === episodeId) {
      pendingUrlEpRef.current = null;
      return;
    }

    if (pendingUrlEpRef.current === episodeId) return;

    pendingUrlEpRef.current = episodeId;
    router.replace(watchPlayPath(animeId, episodeId), { scroll: false });
  }, [episodeId, animeId, router, episodes, setEpisodeId, urlEp]);
}
