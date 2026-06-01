import { AnimeCardSkeleton } from './AnimeCardSkeleton';
import '@/components/Layout/anime-card-feed.scss';

export function AnimeSectionSkeleton({ title }: { title: string }) {
  return (
    <section className="w-full space-y-6 px-4 py-8 md:px-6 lg:px-10">
      <h2 className="text-title text-brand-text-primary">{title}</h2>
      <div className="anime-card-feed">
        {Array.from({ length: 8 }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
