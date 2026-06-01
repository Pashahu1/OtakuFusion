import '@/components/Layout/anime-card-feed.scss';
import '@/components/genre-hub/genre-browse-layout.scss';

import { AnimeCardSkeleton } from '@/components/ui/Skeleton/AnimeCardSkeleton';

export function GenreBrowseSkeleton() {
  return (
    <div className="genre-browse-layout" aria-hidden>
      <div className="mb-6 space-y-3">
        <div className="h-10 w-56 max-w-[70%] animate-pulse rounded bg-white/10" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-20 animate-pulse rounded-md bg-white/5" />
          ))}
        </div>
      </div>
      <div className="anime-card-feed">
        {Array.from({ length: 12 }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
