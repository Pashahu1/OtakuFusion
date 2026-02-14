import { AnimeCardSkeleton } from './AnimeCardSkeleton';
export function AnimeSectionSkeleton({ title }: { title: string }) {
  const isMobile =
    typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <div className="flex flex-col gap-[20px] w-full px-4 lg:px-10 z-2">
      <h2 className="text-title text-brand-text-primary">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-[20px]">
        {!isMobile
          ? Array.from({ length: 8 }).map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))
          : Array.from({ length: 2 }).map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
      </div>
    </div>
  );
}
