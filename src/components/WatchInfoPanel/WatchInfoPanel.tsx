import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import { WatchInfoOverview } from '../DetailsInformation/WatchInfoOverview';
import { WatchInfoSeoInformation } from '../DetailsInformation/WatchInfoSeoInformation';
import { WatchInfoTitle } from '../DetailsInformation/WatchInfoTitle';
import { NextEpisodeSchedule } from '../NextEpisodeShedule/NextEpisodeSchedule';
import { Skeleton } from '../ui/Skeleton/Skeleton';
import { WatchTags } from '../WatchTags/WatchTags';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { useState } from 'react';
import Image from 'next/image';
import { Convertor, LIST_THUMBNAIL_RES } from '@/helper/Convertor';

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
  return (
    <div className="watch-info flex h-full min-h-0 min-w-0 flex-col items-start gap-y-4 self-start overflow-hidden rounded-xl border border-white/10 bg-[#23252b]/85 px-4 py-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md max-[1199px]:order-3 max-md:mt-4 min-[1200px]:py-8 md:max-[1199px]:mt-0 md:px-6 min-[1200px]:px-10 max-[500px]:px-4">
      <div className="relative h-[150px] w-[100px] shrink-0 overflow-hidden rounded-md max-[500px]:h-[90px] max-[500px]:w-[70px]">
        {animeInfo?.poster && (
          <Image
            ref={posterImgRef}
            src={Convertor(animeInfo.poster, LIST_THUMBNAIL_RES)}
            alt={animeInfo.title ? `Poster: ${animeInfo.title}` : 'Anime poster'}
            fill
            quality={75}
            sizes="(max-width: 500px) 70px, 100px"
            priority
            className={`object-cover transition-opacity duration-200 ${posterImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoadingComplete={() => setPosterImageLoaded(true)}
          />
        )}
        {(!animeInfo?.poster || !posterImageLoaded) && (
          <Skeleton className="absolute inset-0 h-full w-full rounded-md" />
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
