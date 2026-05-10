import { AnimeCardSkeleton } from './AnimeCardSkeleton';
import '@/components/Layout/anime-card-feed.scss';

export function AnimeSectionSkeleton({ title }: { title: string }) {
  const isMobile =
    typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <div className="flex flex-col gap-[20px] w-full px-4 lg:px-10 z-2">
      <h2 className="text-title text-brand-text-primary">{title}</h2>
      <div className="anime-card-feed">
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
