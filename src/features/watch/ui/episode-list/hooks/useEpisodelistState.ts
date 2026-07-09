import { episodeMatchesSelection } from '@/shared/utils/episodeUtils';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

interface UseEpisodelistStateResult {
  activeEpisodeId: string | null;
  setActiveEpisodeId: Dispatch<SetStateAction<string | null>>;
  episodeNum: string | null;
}

export function useEpisodelistState(
  currentEpisode: string | null,
  episodes: EpisodesTypes[]
): UseEpisodelistStateResult {
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(currentEpisode);
  const trackedCurrentEpisode = useRef(currentEpisode);
  useEffect(() => {
    if (currentEpisode !== trackedCurrentEpisode.current) {
      trackedCurrentEpisode.current = currentEpisode;
      if (currentEpisode != null) {
        setActiveEpisodeId(currentEpisode);
      }
    }
  }, [currentEpisode])


  const episodeNum = useMemo(() => {
    if (!episodes.length || !activeEpisodeId) return activeEpisodeId;
    const activeEpisode = episodes.find((item) =>
      episodeMatchesSelection(item, activeEpisodeId)
    );
    return activeEpisode ? String(activeEpisode.episode_no) : activeEpisodeId;
  }, [activeEpisodeId, episodes]);

  return {
    activeEpisodeId,
    setActiveEpisodeId,
    episodeNum,
  };
}
