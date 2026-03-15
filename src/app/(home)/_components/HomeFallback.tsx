'use client';

import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { AnimeSectionSkeleton } from '@/components/ui/Skeleton/AnimeSectionSkeleton';
import { PreviewSkeleton } from '@/components/ui/Skeleton/PreviewSkeleton';
import { useEffect, useState } from 'react';

const LOADER_OVERLAY_MS = 350;

export function HomeFallback() {
  const [hideLoaderOverlay, setHideLoaderOverlay] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHideLoaderOverlay(true), LOADER_OVERLAY_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-[100vh]">
      <div className="flex flex-col gap-10">
        <PreviewSkeleton />
        <AnimeSectionSkeleton title="Top Airing" />
        <AnimeSectionSkeleton title="Most Favorite" />
        <AnimeSectionSkeleton title="Latest Episode" />
        <AnimeSectionSkeleton title="Latest Completed" />
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
