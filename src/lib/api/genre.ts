import type { ApiResponse } from '@/lib/api';
import { isBlockedGenreBrowseName } from '@/lib/anime-content-policy';
import { getAniListMediaPage, mapAniListMediaToAnimeInfo } from '@/lib/anilist';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { genreFromSlug } from '@/shared/utils/genre-slug';

export type GenreResults = {
  data?: AnimeInfo[];
  totalPages?: number;
  [key: string]: unknown;
};

export const getGenreAnime = async (
  name: string = 'most-popular',
  page: number = 1
): Promise<ApiResponse<GenreResults>> => {
  const genre = genreFromSlug(name);
  if (isBlockedGenreBrowseName(genre)) {
    return {
      results: {
        data: [],
        totalPages: 1,
      },
    };
  }

  const anilistPage = await getAniListMediaPage({
    page,
    perPage: 20,
    sort: ['POPULARITY_DESC'],
    genre,
  });

  return {
    results: {
      data: (anilistPage.media ?? []).map(mapAniListMediaToAnimeInfo),
      totalPages: anilistPage.pageInfo?.lastPage ?? 1,
    },
  };
};
