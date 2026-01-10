'use client';
import { AnimeCardSkeleton } from '../Skeleton/AnimeCardSkeleton';
export function CategorySkeleton() {
  const isMobile = window.innerWidth < 768;

  return (
    <div className="mt-[80px]">
      <div className="grid grid-cols-2 gap-[20px] px-4 md:grid-cols-3 md:px-6 lg:grid-cols-4 lg:px-10 xl:grid-cols-6">
        {!isMobile
          ? Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="h-[50px] bg-neutral-800 rounded-md animate-pulse"
              />
            ))
          : Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="h-[50px] bg-neutral-800 rounded-md animate-pulse"
              />
            ))}
      </div>
      <div className="flex flex-col gap-[20px] mt-20">
        <div className="flex alight-center justify-center h-[50px] px-4 lg:px-10">
          <span className="w-[400px] bg-neutral-800 rounded-md animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-[20px] px-4 lg:px-10">
          {!isMobile
            ? Array.from({ length: 20 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
              ))
            : Array.from({ length: 10 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
              ))}
        </div>
      </div>

      <div className="flex justify-center mt-10 px-4 lg:px-10">
        <div className="h-[50px] w-[500px] bg-neutral-800 rounded-md animate-pulse" />
      </div>
    </div>
  );
}
