'use client';

import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { ContinueWatchingSectionSkeleton } from '@/components/ui/Skeleton/ContinueWatchingSectionSkeleton';
import { PreviewSkeleton } from '@/components/ui/Skeleton/PreviewSkeleton';
import { SwiperSectionSkeleton } from '@/components/ui/Skeleton/SwiperSectionSkeleton';
import { useEffect, useState } from 'react';

const LOADER_OVERLAY_MS = 350;

const HOME_FEED_CLASS =
  'home-feed flex w-full flex-col gap-8 pt-8 md:gap-10 md:pt-10 lg:gap-10';

export function HomeFallback() {
  const [hideLoaderOverlay, setHideLoaderOverlay] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHideLoaderOverlay(true), LOADER_OVERLAY_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-[100vh]">
      <div className="flex flex-col">
        <PreviewSkeleton />
        <div className={HOME_FEED_CLASS}>
          <ContinueWatchingSectionSkeleton />
          <SwiperSectionSkeleton title="Top Airing" />
          <SwiperSectionSkeleton title="Most Favorite" />
          <SwiperSectionSkeleton title="Latest Episode" />
          <SwiperSectionSkeleton title="Latest Completed" />
        </div>
      </div>
      {!hideLoaderOverlay && (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-brand-gray)]/80"
          aria-hidden
        >
          <InitialLoader />
        </div>
      )}
    </div>
  );
}
