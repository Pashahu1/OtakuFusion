import { AnimeCardSkeleton } from '@/components/ui/Skeleton/AnimeCardSkeleton';
import '@/components/Layout/anime-card-feed.scss';
import '@/components/genre-hub/GenreBrowseFilters.scss';

export function GenreBrowseSkeleton() {
  return (
    <div className="genre-browse-layout animate-pulse" aria-hidden>
      <div className="genre-browse-toolbar genre-browse-layout__toolbar">
        <div className="genre-browse-toolbar__heading">
          <div className="flex flex-wrap items-baseline gap-2">
            <div className="h-8 w-24 rounded bg-white/10" />
            <div className="h-6 w-3 rounded bg-white/5" />
            <div className="h-8 w-32 rounded bg-white/10" />
          </div>
        </div>
        <div className="h-10 w-[5.5rem] shrink-0 rounded-lg bg-white/10" />
      </div>
      <div className="anime-card-feed">
        {Array.from({ length: 12 }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
