import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { useCallback, useMemo } from 'react';
import { WatchEpisodeCard } from '../watch-series/WatchEpisodeCard';
import { EpisodeRangeControls } from './components/EpisodeRangeControls';
import { EpisodelistHeader } from './components/EpisodelistHeader';
import { EpisodelistScrollArea } from './components/EpisodelistScrollArea';
import { useEpisodeNumberSearch } from './hooks/useEpisodeNumberSearch';
import { useEpisodeRangeFilter } from './hooks/useEpisodeRangeFilter';
import { useEpisodelistScroll } from './hooks/useEpisodelistScroll';
import { useEpisodelistState } from './hooks/useEpisodelistState';
import { useRangeDropdown } from './hooks/useRangeDropdown';
import './Episodelist.scss';

interface EpisodelistProps {
  episodes: EpisodesTypes[];
  onEpisodeClick: (episodeId: string) => void;
  currentEpisode: string | null;
  totalEpisodes: number;
  watchedEpisodes?: Record<string, boolean>;
  seriesTitle: string;
  posterUrl: string;
  episodeDuration?: string | null;
}

/** Series page episode grid (thumbnail cards). */
export function Episodelist({
  episodes,
  onEpisodeClick,
  currentEpisode,
  totalEpisodes,
  watchedEpisodes = {},
  seriesTitle,
  posterUrl,
  episodeDuration = null,
}: EpisodelistProps) {
  const { activeEpisodeId, setActiveEpisodeId, episodeNum } =
    useEpisodelistState(currentEpisode, episodes);

  const {
    selectedRange,
    setSelectedRange,
    activeRange,
    setActiveRange,
    handleRangeSelect,
  } = useEpisodeRangeFilter(currentEpisode, episodeNum, totalEpisodes);

  const { showDropDown, setShowDropDown, dropDownRef } = useRangeDropdown();

  const { setSearchedEpisode, handleChange } = useEpisodeNumberSearch({
    episodes,
    totalEpisodes,
    episodeNum,
    setSelectedRange,
    setActiveRange,
  });

  const { listContainerRef } = useEpisodelistScroll(activeEpisodeId);

  const visibleEpisodesInRange = useMemo(() => {
    const [start, end] = selectedRange;
    return episodes.filter((e) => e.episode_no >= start && e.episode_no <= end);
  }, [episodes, selectedRange]);

  const handleEpisodeSelect = useCallback(
    (episodeNumber: string) => {
      onEpisodeClick(episodeNumber);
      setActiveEpisodeId(episodeNumber);
      setSearchedEpisode(null);
    },
    [onEpisodeClick, setActiveEpisodeId, setSearchedEpisode]
  );

  const listEpisodes =
    totalEpisodes > 30 ? visibleEpisodesInRange : episodes;

  return (
    <div className="watch-episodes-section relative flex w-full flex-col">
      <EpisodelistHeader title="Episodes">
        {totalEpisodes > 100 ? (
          <EpisodeRangeControls
            totalEpisodes={totalEpisodes}
            selectedRange={selectedRange}
            activeRange={activeRange}
            showDropDown={showDropDown}
            setShowDropDown={setShowDropDown}
            dropDownRef={dropDownRef}
            handleRangeSelect={handleRangeSelect}
            setActiveRange={setActiveRange}
            onSearchChange={handleChange}
          />
        ) : null}
      </EpisodelistHeader>

      <EpisodelistScrollArea
        listContainerRef={listContainerRef}
        className="watch-episodes-section__scroll"
      >
        <div className="watch-episodes-grid">
          {listEpisodes.map((item) => {
            const episodeNumber =
              getEpisodeNumberFromId(item?.id) ?? String(item.episode_no ?? '');
            const isActive =
              activeEpisodeId === episodeNumber || currentEpisode === episodeNumber;
            const isWatched = episodeNumber
              ? watchedEpisodes[episodeNumber] === true
              : false;

            return (
              <WatchEpisodeCard
                key={item?.id}
                item={item}
                posterUrl={posterUrl}
                seriesTitle={seriesTitle}
                episodeDuration={episodeDuration}
                isActive={isActive}
                isWatched={isWatched}
                onSelect={() => {
                  if (episodeNumber) handleEpisodeSelect(episodeNumber);
                }}
              />
            );
          })}
        </div>
      </EpisodelistScrollArea>
    </div>
  );
}
