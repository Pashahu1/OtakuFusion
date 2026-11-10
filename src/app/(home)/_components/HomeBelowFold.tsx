'use client';

import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { ContinueWatchingSectionSkeleton } from '@/components/ui/Skeleton/ContinueWatchingSectionSkeleton';
import { SwiperSectionSkeleton } from '@/components/ui/Skeleton/SwiperSectionSkeleton';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

const ContinueWatchingSection = dynamic(
  () =>
    import('@/components/ContinueWatchingSection/ContinueWatchingSection').then(
      (m) => m.ContinueWatchingSection,
    ),
  {
    ssr: false,
    loading: () => <ContinueWatchingSectionSkeleton />,
  },
);

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
  'home-feed flex w-full flex-col gap-8 pt-8 pb-6 md:gap-10 md:pt-10 md:pb-8 lg:gap-10';

export function HomeBelowFold({
  topAiring,
  mostFavorite,
  latestEpisode,
  latestCompleted,
}: HomeBelowFoldProps) {
  const { t } = useTranslation('common');

  return (
    <div className={HOME_FEED_SECTION_CLASS}>
      <ContinueWatchingSection />
      <SwiperCard
        title={t('home.topAiring')}
        catalog={topAiring}
        sectionId="top-airing"
        prioritySlideCount={4}
      />
      <SwiperCard
        title={t('home.mostFavorite')}
        catalog={mostFavorite}
        sectionId="most-favorite"
      />
      <SwiperCard
        title={t('home.latestEpisode')}
        catalog={latestEpisode}
        sectionId="latest-episode"
      />
      <SwiperCard
        title={t('home.latestCompleted')}
        catalog={latestCompleted}
        sectionId="latest-completed"
      />
    </div>
  );
}
