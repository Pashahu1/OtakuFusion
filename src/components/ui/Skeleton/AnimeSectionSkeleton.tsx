import '@/components/Layout/anime-card-feed.scss';

import { AnimeCardSkeleton } from '@/components/ui/Skeleton/AnimeCardSkeleton';
import './AnimeSectionSkeleton.scss';

interface AnimeSectionSkeletonProps {
  title?: string;
  cardCount?: number;
}

export function AnimeSectionSkeleton({
  title,
  cardCount = 6,
}: AnimeSectionSkeletonProps) {
  return (
    <section className="anime-section-skeleton w-full space-y-6 px-4 py-8 md:px-6 lg:px-10" aria-hidden>
      <div className="mb-4 flex items-center justify-between">
        {title ? (
          <div className="anime-section-skeleton__title animate-pulse" />
        ) : (
          <span />
        )}
      </div>
      <div className="anime-card-feed">
        {Array.from({ length: cardCount }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
