import { AnimeCardSkeleton } from '../Skeleton/AnimeCardSkeleton';

export function SearchSkeleton() {
  return (
    <div className="mt-20 grid grid-cols-2 gap-4 px-4 sm:grid-cols-3 md:grid-cols-4 md:gap-5 md:px-6 lg:grid-cols-6 lg:px-10 xl:grid-cols-8">
      {Array.from({ length: 20 }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}
