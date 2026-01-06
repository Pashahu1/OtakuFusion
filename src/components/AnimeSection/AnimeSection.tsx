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
    <section className="w-full max-w-[1800px] xl:max-w-[2000px] 2xl:max-w-[2400px] mx-auto px-4 md:px-6 lg:px-10 py-8 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-title text-brand-text-primary">{title}</h2>
      </div>
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,_minmax(140px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(180px,_1fr))] lg:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] xl:grid-cols-[repeat(auto-fit,_minmax(240px,_1fr))] 2xl:grid-cols-[repeat(auto-fit,_minmax(260px,_1fr))]">
        {catalog.map((anime) => (
          <Card key={anime.id} anime={anime} />
        ))}
      </div>
    </section>
  );
};

export default AnimeSection;
