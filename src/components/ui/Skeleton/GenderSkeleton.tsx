import { AnimeCardSkeleton } from '../Skeleton/AnimeCardSkeleton';
export function GenderSkeleton() {
  const isMobile =
    typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <div className="mt-[80px]">
      <div className="flex flex-col w-full max-w-[2400px] mx-auto mt-20 px-4 gap-8">
        <div className="flex alight-center justify-center h-[50px]">
          <span className="w-[400px] bg-neutral-800 rounded-md animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-[20px]">
          {!isMobile
            ? Array.from({ length: 20 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
              ))
            : Array.from({ length: 10 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
              ))}
        </div>
      </div>

      <div className="flex justify-center mt-10 px-4 lg:px-10 xl:grid-cols-6">
        <div className="h-[50px] w-[500px] bg-neutral-800 rounded-md animate-pulse" />
      </div>
    </div>
  );
}
