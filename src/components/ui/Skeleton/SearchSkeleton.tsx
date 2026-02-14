import { AnimeCardSkeleton } from '../Skeleton/AnimeCardSkeleton';

export function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:px-6 lg:grid-cols-8 px-4 lg:px-10 mt-20">
      {Array.from({ length: 20 }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}
