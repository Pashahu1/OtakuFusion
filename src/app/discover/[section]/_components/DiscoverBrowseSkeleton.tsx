import '@/components/Layout/anime-card-feed.scss';
import '@/components/genre-hub/genre-browse-layout.scss';
import '@/components/discover/DiscoverBrowseHeader.scss';

import { AnimeCardSkeleton } from '@/components/ui/Skeleton/AnimeCardSkeleton';

export function DiscoverBrowseSkeleton() {
  return (
    <div className="genre-browse-layout" aria-hidden>
      <header className="discover-browse-header genre-browse-layout__toolbar">
        <div className="h-[clamp(1.75rem,4vw,2.25rem)] w-48 max-w-[12rem] animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-4 w-full max-w-md animate-pulse rounded bg-white/5" />
      </header>
      <div className="anime-card-feed">
        {Array.from({ length: 12 }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
