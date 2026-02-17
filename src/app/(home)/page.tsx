import { AnimeSectionSkeleton } from '@/components/ui/Skeleton/AnimeSectionSkeleton';
import { PreviewSkeleton } from '@/components/ui/Skeleton/PreviewSkeleton';
import { Suspense } from 'react';
import { HomeContent } from '@/app/(home)/_components/HomeContent';

export const revalidate = 3600;

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-10">
          <PreviewSkeleton />
          <AnimeSectionSkeleton title="Top Airing" />
          <AnimeSectionSkeleton title="Most Favorite" />
          <AnimeSectionSkeleton title="Latest Episode" />
          <AnimeSectionSkeleton title="Latest Completed" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
