import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { Ref } from 'react';

interface EpisodeGridItemProps {
  item: EpisodesTypes;
  displayNumber: number;
  episodeNumber: string;
  isActive: boolean;
  isSearched: boolean;
  isWatched: boolean;
  episodeRef: Ref<HTMLDivElement> | null;
  onEpisodeSelect: (episodeNumber: string) => void;
}

export function EpisodeGridItem({
  item,
  displayNumber,
  episodeNumber,
  isActive,
  isSearched,
  isWatched,
  episodeRef,
  onEpisodeSelect,
}: EpisodeGridItemProps) {
  return (
    <div
      ref={episodeRef}
      className={`group relative flex h-[34px] cursor-pointer items-center justify-center rounded-md text-[13px] font-semibold transition-[transform,background-color,box-shadow,color] active:scale-[0.98] ${
        isSearched ? 'glow-animation' : ''
      } ${
        isActive
          ? 'bg-[#f47521]/15 text-[#f47521] ring-2 ring-[#f47521] ring-inset shadow-[inset_0_0_0_1px_rgba(244,117,33,0.25)]'
          : isWatched
            ? 'bg-[#2a2c31] text-white/55 hover:bg-[#f47521]/20 hover:text-[#2a2a2a]'
            : 'bg-[#35373D] text-white hover:bg-[#f47521] hover:text-[#1a1a1a]'
      }`}
      onClick={() => {
        if (episodeNumber) onEpisodeSelect(episodeNumber);
      }}
    >
      {isWatched && !isActive ? (
        <span
          className="absolute bottom-0.5 left-0.5 flex h-3 w-3 items-center justify-center rounded-sm bg-[#1a1b1e]/90 text-[7px] text-[#f47521]/90"
          title="Watched"
        >
          <FontAwesomeIcon icon={faCheck} className="h-2 w-2" />
        </span>
      ) : null}
      {item?.filler ? (
        <span className="absolute top-0 right-0 rounded-bl px-[3px] py-px text-[9px] font-bold uppercase tracking-tighter text-white/55">
          F
        </span>
      ) : null}
      <span
        className={
          isActive
            ? 'text-[#f47521]'
            : item?.filler
              ? 'text-white/70 group-hover:text-[#1a1a1a]'
              : 'group-hover:text-[#1a1a1a]'
        }
      >
        {displayNumber}
      </span>
    </div>
  );
}
