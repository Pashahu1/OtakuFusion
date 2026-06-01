import '@/components/Layout/anime-card-feed.scss';

import { AnimeCardSkeleton } from '@/components/ui/Skeleton/AnimeCardSkeleton';

export function SearchSkeleton() {
  return (
    <div className="anime-card-feed mt-20 px-4 md:px-6 lg:px-10" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}
