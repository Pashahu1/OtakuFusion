import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

interface UseEpisodelistStateResult {
  activeEpisodeId: string | null;
  setActiveEpisodeId: Dispatch<SetStateAction<string | null>>;
  episodeNum: string | null;
  setEpisodeNum: Dispatch<SetStateAction<string | null>>;
}

export function useEpisodelistState(
  currentEpisode: string | null,
  episodes: EpisodesTypes[]
): UseEpisodelistStateResult {
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(
    currentEpisode
  );
  const [episodeNum, setEpisodeNum] = useState<string | null>(currentEpisode);

  useEffect(() => {
    if (currentEpisode != null) {
      setActiveEpisodeId(currentEpisode);
      setEpisodeNum(currentEpisode);
    }
  }, [currentEpisode]);

  useEffect(() => {
    setActiveEpisodeId(episodeNum);
  }, [episodeNum]);

  useEffect(() => {
    if (!Array.isArray(episodes)) return;
    const activeEpisode = episodes.find(
      (item) => getEpisodeNumberFromId(item?.id) === activeEpisodeId
    );
    if (activeEpisode) {
      setEpisodeNum(String(activeEpisode.episode_no));
    }
  }, [activeEpisodeId, episodes]);

  return {
    activeEpisodeId,
    setActiveEpisodeId,
    episodeNum,
    setEpisodeNum,
  };
}
