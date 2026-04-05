import { getGenreAnime } from '@/services/getGenreAnime';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { Card } from '@/components/Card/Card';
import { Pagination } from '@/components/Pagination/Pagination';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { ErrorState } from '@/components/ui/states/ErrorState';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

interface Props {
  gender: string;
  page: number;
}

export async function GenderData({ gender, page }: Props) {
  const decodedTitle = decodeURIComponent(gender).replaceAll('-', ' ');

  let data: AnimeInfo[] | null = null;
  let totalPages: number | undefined;
  let hasError = false;

  try {
    const res = await getGenreAnime(gender, page);
    data = res.results.data ?? null;
    totalPages = res.results.totalPages;
  } catch {
    hasError = true;
  }

  if (hasError) {
    return <ErrorState message="Failed to load genre data." />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState fullPage message={`No anime found for ${decodedTitle}.`} />
    );
  }

  return (
    <div className="mt-[80px] px-4 md:px-6 lg:px-10">
      <AnimeListLayout title={decodedTitle}>
        {data.map((anime: AnimeInfo, index: number) => (
          <Card
            key={anime.id}
            anime={anime}
            priority={index === 0}
            posterEager={index < 6}
            posterQuality={58}
          />
        ))}
      </AnimeListLayout>

      <Pagination pageCount={totalPages ?? 1} currentPage={page} />
    </div>
  );
}
