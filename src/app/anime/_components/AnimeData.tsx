import { getCategory } from '@/services/getCategory';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { Card } from '@/components/Card/Card';
import {
  ANIME_CAROUSEL_POSTER_QUALITY,
  ANIME_CAROUSEL_POSTER_SIZES,
} from '@/lib/anime-card-poster';
import { Pagination } from '@/components/Pagination/Pagination';
import { EmptyState } from '@/components/ui/states/EmptyState';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

interface Props {
  category: string;
  page: number;
}

export async function AnimeData({ category, page }: Props) {
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
        {data.map((anime: AnimeInfo) => (
          <Card
            key={anime.id}
            anime={anime}
            posterSizes={ANIME_CAROUSEL_POSTER_SIZES}
            posterQuality={ANIME_CAROUSEL_POSTER_QUALITY}
          />
        ))}
      </AnimeListLayout>

      <Pagination pageCount={totalPages ?? 1} currentPage={page} />
    </>
  );
}
