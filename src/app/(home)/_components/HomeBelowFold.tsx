'use client';

import dynamic from 'next/dynamic';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

/** Нижче згину: Swiper у окремих чанках — менше parse/eval на main thread при старті (TBT). */
const ContinueWatchingSection = dynamic(
  () =>
    import('@/components/ContinueWatchingSection/ContinueWatchingSection').then(
      (m) => m.ContinueWatchingSection
    ),
  { ssr: false, loading: () => <HomeSectionPulse className="min-h-[120px]" /> }
);

const SwiperCard = dynamic(
  () => import('@/components/SwiperCard/SwiperCard').then((m) => m.SwiperCard),
  {
    ssr: false,
    loading: () => (
      <div
        className="mx-4 min-h-[220px] animate-pulse rounded-xl bg-white/5 md:mx-6 lg:mx-10"
        aria-hidden
      />
    ),
  }
);

function HomeSectionPulse({ className }: { className?: string }) {
  return (
    <div
      className={`mx-4 md:mx-6 lg:mx-10 ${className ?? ''}`}
      aria-hidden
    >
      <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
      <div className="mt-4 h-40 animate-pulse rounded-lg bg-white/5" />
    </div>
  );
}

interface HomeBelowFoldProps {
  topAiring: AnimeInfo[];
  mostFavorite: AnimeInfo[];
  latestEpisode: AnimeInfo[];
  latestCompleted: AnimeInfo[];
}

export function HomeBelowFold({
  topAiring,
  mostFavorite,
  latestEpisode,
  latestCompleted,
}: HomeBelowFoldProps) {
  return (
    <>
      <ContinueWatchingSection />
      <div className="flex flex-col gap-8 md:gap-10 lg:gap-[40px]">
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
    </>
  );
}
