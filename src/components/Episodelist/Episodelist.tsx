import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { useCallback } from 'react';
import { EpisodeFindInput } from './components/EpisodeFindInput';
import { EpisodeListToolbar } from './components/EpisodeListToolbar';
import { EpisodeGridItem } from './components/EpisodeGridItem';
import { EpisodeListItem } from './components/EpisodeListItem';
import { EpisodeRangeControls } from './components/EpisodeRangeControls';
import { EpisodelistHeader } from './components/EpisodelistHeader';
import { EpisodelistScrollArea } from './components/EpisodelistScrollArea';
import { useEpisodeNumberSearch } from './hooks/useEpisodeNumberSearch';
import { useEpisodeRangeFilter } from './hooks/useEpisodeRangeFilter';
import { useEpisodelistScroll } from './hooks/useEpisodelistScroll';
import { useEpisodelistState } from './hooks/useEpisodelistState';
import { useRangeDropdown } from './hooks/useRangeDropdown';
import './Episodelist.scss';

interface EpisodeType {
  episodes: EpisodesTypes[];
  onEpisodeClick: (episodeId: string) => void;
  currentEpisode: string | null;
  totalEpisodes: number;
  watchedEpisodes?: Record<string, boolean>;
}

export function Episodelist({
  episodes,
  onEpisodeClick,
  currentEpisode,
  totalEpisodes,
  watchedEpisodes = {},
}: EpisodeType) {
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

  const { searchedEpisode, setSearchedEpisode, handleChange } =
    useEpisodeNumberSearch({
      episodes,
      totalEpisodes,
      episodeNum,
      setSelectedRange,
      setActiveRange,
    });

  const { listContainerRef, activeEpisodeRef } =
    useEpisodelistScroll(activeEpisodeId);

  const handleEpisodeSelect = useCallback(
    (episodeNumber: string) => {
      onEpisodeClick(episodeNumber);
      setActiveEpisodeId(episodeNumber);
      setSearchedEpisode(null);
    },
    [onEpisodeClick, setActiveEpisodeId, setSearchedEpisode]
  );

  const gridClassName =
    totalEpisodes > 30
      ? 'grid grid-cols-5 gap-2 p-3 max-[1200px]:grid-cols-12 max-[860px]:grid-cols-10 max-[575px]:grid-cols-8 max-[478px]:grid-cols-6 max-[350px]:grid-cols-5'
      : 'flex flex-col gap-2 p-2.5 pb-3';

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col max-[1200px]:max-h-[500px]">
      <EpisodelistHeader>
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
        ) : (
          <EpisodeListToolbar>
            <EpisodeFindInput
              onSearchChange={handleChange}
              placeholder="Find by episode number…"
              className="w-full rounded-lg border border-white/12 bg-[#25262b] px-4 py-2.5 shadow-none focus-within:border-[#f47521]/45 focus-within:shadow-[0_0_0_1px_rgba(244,117,33,0.15)]"
            />
          </EpisodeListToolbar>
        )}
      </EpisodelistHeader>

      <EpisodelistScrollArea listContainerRef={listContainerRef}>
        <div className={gridClassName}>
          {totalEpisodes > 30
            ? episodes
                .slice(selectedRange[0] - 1, selectedRange[1])
                .map((item, index) => {
                  const episodeNumber =
                    getEpisodeNumberFromId(item?.id) ?? '';
                  const isActive =
                    activeEpisodeId === episodeNumber ||
                    currentEpisode === episodeNumber;
                  const isSearched = searchedEpisode === item?.id;
                  const isWatched = episodeNumber
                    ? watchedEpisodes[episodeNumber] === true
                    : false;

                  return (
                    <EpisodeGridItem
                      key={item?.id}
                      item={item}
                      displayNumber={index + selectedRange[0]}
                      episodeNumber={episodeNumber}
                      isActive={isActive}
                      isSearched={isSearched}
                      isWatched={isWatched}
                      episodeRef={isActive ? activeEpisodeRef : null}
                      onEpisodeSelect={handleEpisodeSelect}
                    />
                  );
                })
            : episodes?.map((item, index) => {
                const episodeNumber =
                  getEpisodeNumberFromId(item?.id) ?? '';
                const isActive =
                  activeEpisodeId === episodeNumber ||
                  currentEpisode === episodeNumber;
                const isSearched = searchedEpisode === item?.id;
                const isWatched = episodeNumber
                  ? watchedEpisodes[episodeNumber] === true
                  : false;

                return (
                  <EpisodeListItem
                    key={item?.id}
                    item={item}
                    listIndex={index + 1}
                    episodeNumber={episodeNumber}
                    isActive={isActive}
                    isSearched={isSearched}
                    isWatched={isWatched}
                    episodeRef={isActive ? activeEpisodeRef : null}
                    onEpisodeSelect={handleEpisodeSelect}
                  />
                );
              })}
        </div>
      </EpisodelistScrollArea>
    </div>
  );
}
