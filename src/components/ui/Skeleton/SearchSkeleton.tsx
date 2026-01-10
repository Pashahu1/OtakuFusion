'use client';

import { AnimeCardSkeleton } from '../Skeleton/AnimeCardSkeleton';

export function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 px-4 md:grid-cols-3 md:px-6 lg:grid-cols-4 lg:px-10">
      {Array.from({ length: 12 }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}
