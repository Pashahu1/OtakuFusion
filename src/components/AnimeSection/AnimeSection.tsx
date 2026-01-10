import type { AnimeInfo } from '@/shared/types/GlobalTypes';
import { Card } from '../Card/Card';
import { isArray } from 'lodash';
import EmptyState from '../ui/states/EmptyState';

type Props = {
  title: string;
  catalog: AnimeInfo[];
};

const AnimeSection = ({ title, catalog }: Props) => {
  if (!isArray(catalog)) {
    return null;
  }

  if (catalog.length === 0) {
    return <EmptyState fullPage title={title} message="No anime found" />;
  }

  return (
    <section className="w-full px-4 md:px-6 lg:px-10 py-8 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-title text-brand-text-primary">{title}</h2>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8">
        {catalog.map((anime) => (
          <Card key={anime.id} anime={anime} />
        ))}
      </div>
    </section>
  );
};

export default AnimeSection;
