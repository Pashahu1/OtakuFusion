'use client';
import { AnimeCardSkeleton } from '../Skeleton/AnimeCardSkeleton';
export function GenderSkeleton() {
  const isMobile = window.innerWidth < 768;

  return (
    <div className="mt-[80px]">
      <div className="flex flex-col w-full max-w-[2400px] mx-auto mt-20 px-4 gap-8">
        <div className="flex alight-center justify-center h-[50px]">
          <span className="w-[400px] bg-neutral-800 rounded-md animate-pulse" />
        </div>
        <div className="grid gap-5 w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))] md:gap-6 lg:gap-8 auto-rows-fr">
          {!isMobile
            ? Array.from({ length: 20 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
              ))
            : Array.from({ length: 2 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
              ))}
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <div className="h-[50px] w-[500px] bg-neutral-800 rounded-md animate-pulse" />
      </div>
    </div>
  );
}
