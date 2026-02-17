import { getGenreAnime } from '@/services/getGenreAnime';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { Card } from '@/components/Card/Card';
import { Pagination } from '@/components/Pagination/Pagination';
import EmptyState from '@/components/ui/states/EmptyState';
import ErrorState from '@/components/ui/states/ErrorState';

interface Props {
  gender: string;
  page: number;
}

export default async function GenderData({ gender, page }: Props) {
  try {
    const decodedTitle = decodeURIComponent(gender).replaceAll('-', ' ');

    const res = await getGenreAnime(gender, page);
    const data = res.results.data;
    const totalPages = res.results.totalPages;

    if (!data || data.length === 0) {
      return (
        <EmptyState fullPage message={`No anime found for ${decodedTitle}.`} />
      );
    }

    return (
      <div className='mt-[80px] px-4 lg:px-10'>
        <AnimeListLayout title={decodedTitle}>
          {data.map((anime: any) => (
            <Card key={anime.id} anime={anime} />
          ))}
        </AnimeListLayout>

        <Pagination pageCount={totalPages} currentPage={page} />
      </div>
    );
  } catch (error) {
    return <ErrorState message="Failed to load genre data." />;
  }
}
