import { AnimeCardSkeleton } from '../Skeleton/AnimeCardSkeleton';
import '@/components/Layout/anime-card-feed.scss';

export function SearchSkeleton() {
  return (
    <div className="anime-card-feed mt-20 px-4 md:px-6 lg:px-10">
      {Array.from({ length: 20 }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}
