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
import { Convertor } from '@/helper/Convertor';

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
    <div className="watch-info flex h-full min-h-0 min-w-0 flex-col items-start gap-y-4 self-start overflow-hidden rounded-xl border border-white/10 bg-[#23252b]/85 px-4 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md max-[1200px]:order-3 max-[1024px]:mt-4 max-[1024px]:px-[30px] max-[500px]:mt-4 max-[500px]:px-4 md:px-6 lg:px-10">
      <div className="relative h-[150px] w-[100px] shrink-0 overflow-hidden rounded-md max-[500px]:h-[90px] max-[500px]:w-[70px]">
        {animeInfo?.poster && (
          <Image
            ref={posterImgRef}
            src={Convertor(animeInfo.poster)}
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
