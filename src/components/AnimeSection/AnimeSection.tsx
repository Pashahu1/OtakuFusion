import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { Card } from '../Card/Card';
import { isArray } from 'lodash';
import EmptyState from '../ui/states/EmptyState';
import { TitleRefactor } from '@/helper/TitleRefactor';

type Props = {
  title: string;
  catalog: AnimeInfo[];
};

export const AnimeSection = ({ title, catalog }: Props) => {
  if (!isArray(catalog)) {
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8">
        {catalog.map((anime) => (
          <Card key={anime.id} anime={anime} />
        ))}
      </div>
    </section>
  );
};
