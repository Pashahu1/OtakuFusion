import { findRangeForEpisode } from '../utils/episodeRangeUtils';
import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

interface UseEpisodeRangeFilterResult {
  selectedRange: number[];
  setSelectedRange: Dispatch<SetStateAction<number[]>>;
  activeRange: string;
  setActiveRange: Dispatch<SetStateAction<string>>;
  handleRangeSelect: (range: string) => void;
}

export function useEpisodeRangeFilter(
  currentEpisode: string | null,
  episodeNum: string | null,
  totalEpisodes: number
): UseEpisodeRangeFilterResult {
  const [selectedRange, setSelectedRange] = useState([1, 100]);
  const [activeRange, setActiveRange] = useState('1-100');

  useEffect(() => {
    if (currentEpisode && episodeNum) {
      const episodeNumNumber =
        typeof episodeNum === 'string' ? parseInt(episodeNum, 10) : episodeNum;
      if (
        episodeNumNumber < selectedRange[0] ||
        episodeNumNumber > selectedRange[1]
      ) {
        const newRange = findRangeForEpisode(episodeNumNumber, totalEpisodes);
        setSelectedRange(newRange);
        setActiveRange(`${newRange[0]}-${newRange[1]}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEpisode, totalEpisodes, episodeNum]);

  function handleRangeSelect(range: string) {
    const [start, end] = range.split('-').map(Number);
    setSelectedRange([start, end]);
  }

  return {
    selectedRange,
    setSelectedRange,
    activeRange,
    setActiveRange,
    handleRangeSelect,
  };
}
