import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { useMemo } from 'react';
import { getTags } from './tags';
import { Tag } from './Tag';

interface WatchTagsProps {
  animeInfo: AnimeData | null;
}

export function WatchTags({ animeInfo }: WatchTagsProps) {
  const tagsList = useMemo(() => getTags(animeInfo), [animeInfo]);

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
