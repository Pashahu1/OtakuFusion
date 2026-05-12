'use client';

import type {
  AnimeInfo,
  NextEpisodeScheduleResult,
} from '@/shared/types/GlobalAnimeTypes';
import { FavoriteBookmark } from '@/components/Card/FavoriteBookmark';
import { WatchInfoOverview } from '../DetailsInformation/WatchInfoOverview';
import { WatchInfoSeoInformation } from '../DetailsInformation/WatchInfoSeoInformation';
import { WatchInfoTitle } from '../DetailsInformation/WatchInfoTitle';
import { NextEpisodeSchedule } from '../NextEpisodeShedule/NextEpisodeSchedule';
import { Skeleton } from '../ui/Skeleton/Skeleton';
import { WatchTags } from '../WatchTags/WatchTags';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { useState } from 'react';
import Image from 'next/image';
import { Bookmark } from 'lucide-react';
import { useIsFavoriteAnime } from '@/hooks/useFavorites';
import { Convertor, LIST_THUMBNAIL_RES } from '@/helper/Convertor';

/** Для API favorites потрібний той самий контур, що й у картках каталогу. */
function animeDataToAnimeInfo(data: AnimeData): AnimeInfo {
  return {
    id: data.id,
    data_id: data.data_id,
    poster: data.poster,
    title: data.title,
    japanese_title: data.japanese_title,
    description: data.animeInfo?.Overview,
    tvInfo: data.animeInfo?.tvInfo,
    adultContent: data.adultContent,
  };
}

const favoriteIconClass =
  'h-6 w-6 shrink-0 stroke-[var(--color-brand-orange)] text-[var(--color-brand-orange)] sm:h-[26px] sm:w-[26px]';

type WatchInfoPanelProps = {
  animeInfo: AnimeData | null;
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  posterImgRef: React.RefObject<HTMLImageElement | null>;
  isFullOverview: boolean;
  setIsFullOverview: (isFullOverview: boolean) => void;
};

export const WatchInfoPanel = ({
  animeInfo,
  nextEpisodeSchedule,
  posterImgRef,
  isFullOverview,
  setIsFullOverview,
}: WatchInfoPanelProps) => {
  const [posterImageLoaded, setPosterImageLoaded] = useState(false);
  const isFavorite = useIsFavoriteAnime(animeInfo?.id ?? '');
  return (
    <div className="watch-info flex h-full min-h-0 min-w-0 flex-col items-start gap-y-4 self-start overflow-hidden rounded-xl border border-white/10 bg-[#23252b]/85 px-4 py-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md max-[1199px]:order-3 max-md:mt-4 min-[1200px]:py-8 md:max-[1199px]:mt-0 md:px-6 min-[1200px]:px-10 max-[500px]:px-4">
      <div className="flex w-full min-w-0 flex-row items-start justify-between gap-3">
        <div className="relative h-[150px] w-[100px] shrink-0 overflow-hidden rounded-md max-[500px]:h-[90px] max-[500px]:w-[70px]">
          {animeInfo?.poster && (
            <Image
              ref={posterImgRef}
              src={Convertor(animeInfo.poster, LIST_THUMBNAIL_RES)}
              alt={
                animeInfo.title ? `Poster: ${animeInfo.title}` : 'Anime poster'
              }
              fill
              priority
              quality={75}
              sizes="(max-width: 500px) 70px, 100px"
              className={`object-cover transition-opacity duration-200 ${posterImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setPosterImageLoaded(true)}
            />
          )}
          {(!animeInfo?.poster || !posterImageLoaded) && (
            <Skeleton className="absolute inset-0 h-full w-full rounded-md" />
          )}
          {animeInfo && isFavorite ? (
            <div
              className="pointer-events-none absolute top-0 right-0 z-[2] h-[36px] w-[36px] max-[500px]:h-[28px] max-[500px]:w-[28px]"
              aria-hidden
            >
              <div className="absolute top-0 right-0 h-0 w-0 border-l-[36px] border-t-[36px] border-l-transparent border-t-black max-[500px]:border-l-[28px] max-[500px]:border-t-[28px]" />
              <Bookmark
                className="absolute top-[6px] right-[5px] h-3 w-3 fill-[var(--color-brand-orange)] max-[500px]:top-[5px] max-[500px]:right-[4px] max-[500px]:h-2.5 max-[500px]:w-2.5"
                strokeWidth={0}
              />
            </div>
          ) : null}
        </div>
        {animeInfo ? (
          <div className="flex min-h-[44px] min-w-[44px] shrink-0 items-start justify-end pt-0.5">
            <FavoriteBookmark
              anime={animeDataToAnimeInfo(animeInfo)}
              iconClassName={favoriteIconClass}
            />
          </div>
        ) : (
          <div
            className="min-h-[44px] min-w-[44px] shrink-0"
            aria-hidden
          />
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-start gap-y-2 overflow-hidden">
        <WatchInfoTitle title={animeInfo?.title} />
        <NextEpisodeSchedule
          nextEpisodeSchedule={nextEpisodeSchedule}
          isLoading={!animeInfo}
        />
        <WatchTags animeInfo={animeInfo} />
        <WatchInfoOverview
          overview={animeInfo?.animeInfo?.Overview}
          isFullOverview={isFullOverview}
          setIsFullOverview={setIsFullOverview}
        />
        <WatchInfoSeoInformation title={animeInfo?.title} />
      </div>
    </div>
  );
};
