import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { useMemo } from 'react';
import { getTags } from './tags';
import { Tag } from './Tag';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';

interface WatchTagsProps {
  animeInfo: AnimeData | null;
}

const TAG_SKELETON_WIDTHS = ['w-12', 'w-10', 'w-14', 'w-9', 'w-11', 'w-8'];

export function WatchTags({ animeInfo }: WatchTagsProps) {
  const tagsList = useMemo(() => getTags(animeInfo), [animeInfo]);

  if (!animeInfo) {
    return (
      <div className="flex min-w-0 shrink-0 flex-wrap gap-x-[6px] gap-y-[6px]">
        {TAG_SKELETON_WIDTHS.map((w, i) => (
          <Skeleton
            key={i}
            className={`h-[22px] shrink-0 rounded-[4px] ${w}`}
            aria-hidden
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 shrink-0 flex-wrap gap-x-[2px] gap-y-[3px]">
      {tagsList
        .filter((item) => item.condition)
        .map(({ icon, bgColor, text }, index) => (
          <Tag
            key={index}
            index={index}
            bgColor={bgColor}
            icon={icon}
            text={text}
          />
        ))}

      <div className="ml-1 flex w-fit items-center">
        {[
          animeInfo?.animeInfo?.tvInfo?.showType,
          animeInfo?.animeInfo?.tvInfo?.duration,
        ].map(
          (item, index) =>
            item && (
              <div key={index} className="flex h-fit items-center gap-x-2">
                <div className="dot mt-[2px]"></div>
                <p className="text-[14px]">{item}</p>
              </div>
            )
        )}
      </div>
    </div>
  );
}
