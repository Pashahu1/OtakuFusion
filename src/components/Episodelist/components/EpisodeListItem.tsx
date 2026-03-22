import { faCheck, faCirclePlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { Ref } from 'react';

interface EpisodeListItemProps {
  item: EpisodesTypes;
  listIndex: number;
  episodeNumber: string;
  isActive: boolean;
  isSearched: boolean;
  isWatched: boolean;
  episodeRef: Ref<HTMLDivElement> | null;
  onEpisodeSelect: (episodeNumber: string) => void;
}

export function EpisodeListItem({
  item,
  listIndex,
  episodeNumber,
  isActive,
  isSearched,
  isWatched,
  episodeRef,
  onEpisodeSelect,
}: EpisodeListItemProps) {
  const titleClass =
    isActive
      ? 'text-[#ff640a]'
      : isWatched
        ? 'text-white/50 group-hover:text-[#ff640a]/85'
        : 'text-white group-hover:text-[#ff640a]/90';

  return (
    <div
      ref={episodeRef}
      className={`group relative w-full cursor-pointer rounded-lg transition-colors ${
        isSearched ? 'glow-animation' : ''
      }`}
      onClick={() => {
        if (episodeNumber) onEpisodeSelect(episodeNumber);
      }}
    >
      {isActive ? (
        <span
          className="absolute top-1/2 left-0 z-[1] h-[55%] w-1 -translate-y-1/2 rounded-full bg-[#f47521] shadow-[0_0_12px_rgba(244,117,33,0.45)]"
          aria-hidden
        />
      ) : null}

      <div
        className={`relative flex w-full items-center gap-3 rounded-lg border py-2.5 pr-3 pl-3 transition-[background-color,border-color] md:gap-3.5 md:pl-4 ${
          isActive
            ? 'border-[#f47521]/25 bg-[#f47521]/[0.12]'
            : 'border-transparent bg-white/[0.03] hover:border-white/[0.08] hover:bg-white/[0.06]'
        }`}
      >
        <div className="flex shrink-0 items-center gap-2">
          {isWatched ? (
            <span
              className="flex h-6 w-6 items-center justify-center text-[#f47521]/65"
              title="Watched"
            >
              <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" />
            </span>
          ) : null}
          <span
            className={`flex h-8 min-w-[2rem] items-center justify-center rounded-md tabular-nums ${
              isActive
                ? 'bg-[#f47521]/18 text-[13px] font-semibold text-[#ff640a]'
                : 'bg-white/[0.07] text-[12px] font-semibold text-white/50'
            }`}
          >
            {listIndex}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <p
            className={`line-clamp-1 text-left text-[15px] leading-snug font-medium transition-colors ${titleClass}`}
          >
            {item?.title}
          </p>
          {isActive ? (
            <FontAwesomeIcon
              icon={faCirclePlay}
              className="h-[18px] w-[18px] shrink-0 text-[#ff640a]"
              aria-hidden
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
