import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { Card } from '../Card/Card';
import { EmptyState } from '../ui/states/EmptyState';

type Props = {
  title: string;
  catalog: AnimeInfo[];
};

export const AnimeSection = ({ title, catalog }: Props) => {
  if (!Array.isArray(catalog)) {
    return null;
  }

  if (catalog.length === 0) {
    return <EmptyState fullPage title={title} message="No anime found" />;
  }

  return (
    <section className="w-full space-y-6 px-4 py-8 md:px-6 lg:px-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-title text-brand-text-primary">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 sm:gap-4 md:gap-5">
        {catalog.map((anime) => (
          <Card key={anime.id} anime={anime} />
        ))}
      </div>
    </section>
  );
};
