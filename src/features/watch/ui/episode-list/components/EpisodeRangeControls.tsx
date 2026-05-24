import {
  faAngleDown,
  faCheck,
  faList,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EpisodeFindInput } from './EpisodeFindInput';
import { EpisodeListToolbar } from './EpisodeListToolbar';
import { generateRangeOptions } from '../utils/episodeRangeUtils';
import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react';

interface EpisodeRangeControlsProps {
  totalEpisodes: number;
  selectedRange: number[];
  activeRange: string;
  showDropDown: boolean;
  setShowDropDown: Dispatch<SetStateAction<boolean>>;
  dropDownRef: RefObject<HTMLDivElement | null>;
  handleRangeSelect: (range: string) => void;
  setActiveRange: Dispatch<SetStateAction<string>>;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function EpisodeRangeControls({
  totalEpisodes,
  selectedRange,
  activeRange,
  showDropDown,
  setShowDropDown,
  dropDownRef,
  handleRangeSelect,
  setActiveRange,
  onSearchChange,
}: EpisodeRangeControlsProps) {
  const rangeOptions = generateRangeOptions(totalEpisodes);
  const rangeCount = rangeOptions.length;
  const needsRangeListScroll = totalEpisodes > 300 || rangeCount > 3;
  const rangeListScrollClass = needsRangeListScroll
    ? 'max-h-[min(13rem,38vh)] overflow-y-auto'
    : 'max-h-none overflow-y-visible';

  return (
    <EpisodeListToolbar>
      <div ref={dropDownRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setShowDropDown((prev) => !prev)}
          className="flex min-h-[2.75rem] min-w-[12rem] w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/12 bg-[#25262b] px-4 py-2.5 text-white shadow-sm transition-colors hover:border-[#f47521]/35 hover:bg-[#2a2c32]"
          aria-expanded={showDropDown}
          aria-haspopup="listbox"
        >
          <span className="flex items-center gap-2.5">
            <FontAwesomeIcon
              icon={faList}
              className="h-3.5 w-3.5 shrink-0 text-[#f47521]"
            />
            <span className="text-[13px] font-semibold">
              EPS:&nbsp;{selectedRange[0]}-{selectedRange[1]}
            </span>
          </span>
          <FontAwesomeIcon
            icon={faAngleDown}
            className={`h-3 w-3 shrink-0 text-white/45 transition-transform ${
              showDropDown ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showDropDown ? (
          <div
            className={`episode-range-dropdown__scroll absolute top-full left-0 z-40 mt-2 w-[min(calc(100vw-2rem),17.5rem)] max-w-[17.5rem] overscroll-contain rounded-lg border border-white/15 bg-[#1a1c20] shadow-[0_12px_36px_rgba(0,0,0,0.5)] sm:w-[17.5rem] ${rangeListScrollClass}`}
            role="listbox"
            aria-label="Episode range"
          >
            <ul className="flex flex-col gap-0">
              {rangeOptions.map((item, index) => {
                const isActive = item === activeRange;
                return (
                  <li
                    key={index}
                    className={`w-full ${
                      isActive
                        ? 'bg-[#f47521]/14 text-[#f47521]'
                        : 'text-white/90 hover:bg-white/[0.07]'
                    }`}
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        handleRangeSelect(item);
                        setActiveRange(item);
                        setShowDropDown(false);
                      }}
                      className="flex min-h-[1.875rem] w-full cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-left text-[12px] font-semibold transition-colors sm:min-h-[3rem] sm:px-4 sm:py-3 sm:text-[13px]"
                    >
                      <span>EPS:&nbsp;{item}</span>
                      {isActive ? (
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="h-3 w-3 shrink-0"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <EpisodeFindInput
        onSearchChange={onSearchChange}
        placeholder="Number of Ep"
        className="min-w-[140px] flex-1 rounded-lg border border-white/12 bg-[#25262b] px-4 py-2.5 shadow-none focus-within:border-[#f47521]/45 focus-within:shadow-[0_0_0_1px_rgba(244,117,33,0.15)] sm:max-w-[320px]"
      />
    </EpisodeListToolbar>
  );
}
