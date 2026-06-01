'use client';

import dynamic from 'next/dynamic';
import { SwiperSectionSkeleton } from '@/components/ui/Skeleton/SwiperSectionSkeleton';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

const SwiperCard = dynamic(
  () => import('@/components/SwiperCard/SwiperCard').then((m) => m.SwiperCard),
  {
    ssr: false,
    loading: () => <SwiperSectionSkeleton />,
  },
);

interface HomeBelowFoldProps {
  topAiring: AnimeInfo[];
  mostFavorite: AnimeInfo[];
  latestEpisode: AnimeInfo[];
  latestCompleted: AnimeInfo[];
}

const HOME_FEED_SECTION_CLASS =
  'home-feed flex w-full flex-col gap-8 pt-8 md:gap-10 md:pt-10 lg:gap-10';

export function HomeBelowFold({
  topAiring,
  mostFavorite,
  latestEpisode,
  latestCompleted,
}: HomeBelowFoldProps) {
  return (
    <div className={HOME_FEED_SECTION_CLASS}>
      <SwiperCard title="Top Airing" catalog={topAiring} sectionId="top-airing" />
      <SwiperCard
        title="Most Favorite"
        catalog={mostFavorite}
        sectionId="most-favorite"
      />
      <SwiperCard
        title="Latest Episode"
        catalog={latestEpisode}
        sectionId="latest-episode"
      />
      <SwiperCard
        title="Latest Completed"
        catalog={latestCompleted}
        sectionId="latest-completed"
      />
    </div>
  );
}
