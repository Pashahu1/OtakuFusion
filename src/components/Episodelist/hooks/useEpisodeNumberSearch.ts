import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { findRangeForEpisode } from '../utils/episodeRangeUtils';
import {
  useCallback,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';

interface UseEpisodeNumberSearchParams {
  episodes: EpisodesTypes[];
  totalEpisodes: number;
  episodeNum: string | null;
  setSelectedRange: Dispatch<SetStateAction<number[]>>;
  setActiveRange: Dispatch<SetStateAction<string>>;
}

export function useEpisodeNumberSearch({
  episodes,
  totalEpisodes,
  episodeNum,
  setSelectedRange,
  setActiveRange,
}: UseEpisodeNumberSearchParams) {
  const [searchedEpisode, setSearchedEpisode] = useState<string | null>(null);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (value.trim() === '') {
        const newRange = findRangeForEpisode(1, totalEpisodes);
        setSelectedRange(newRange);
        setActiveRange(`${newRange[0]}-${newRange[1]}`);
        setSearchedEpisode(null);
      } else if (!value || Number.isNaN(Number(value))) {
        setSearchedEpisode(null);
      } else if (
        !Number.isNaN(Number(value)) &&
        parseInt(value, 10) > totalEpisodes &&
        episodeNum !== null
      ) {
        const episodeNumNumber =
          typeof episodeNum === 'string'
            ? parseInt(episodeNum, 10)
            : episodeNum;
        const newRange = findRangeForEpisode(episodeNumNumber, totalEpisodes);
        setSelectedRange(newRange);
        setActiveRange(`${newRange[0]}-${newRange[1]}`);
        setSearchedEpisode(null);
      } else if (!Number.isNaN(Number(value)) && value.trim() !== '') {
        const num = parseInt(value, 10);
        const foundEpisode = episodes.find((item) => item?.episode_no === num);
        if (foundEpisode) {
          const newRange = findRangeForEpisode(num, totalEpisodes);
          setSelectedRange(newRange);
          setActiveRange(`${newRange[0]}-${newRange[1]}`);
          setSearchedEpisode(foundEpisode?.id);
        }
      } else {
        setSearchedEpisode(null);
      }
    },
    [episodes, totalEpisodes, episodeNum, setSelectedRange, setActiveRange]
  );

  return { searchedEpisode, setSearchedEpisode, handleChange };
}
