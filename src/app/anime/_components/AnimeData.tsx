import { getCategory } from '@/services/getCategory';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { Card } from '@/components/Card/Card';
import { Pagination } from '@/components/Pagination/Pagination';
import EmptyState from '@/components/ui/states/EmptyState';

interface Props {
  category: string;
  page: number;
}

export default async function AnimeData({ category, page }: Props) {
  const res = await getCategory(category, page);
  const data = res.results.data;
  const totalPages = res.results.totalPages;

  const titleCategory = category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (!data || data.length === 0) {
    return (
      <EmptyState fullPage title={titleCategory} message="No anime found." />
    );
  }

  return (
    <>
      <AnimeListLayout title={titleCategory}>
        {data.map((anime: any) => (
          <Card key={anime.id} anime={anime} />
        ))}
      </AnimeListLayout>

      <Pagination pageCount={totalPages} currentPage={page} />
    </>
  );
}
