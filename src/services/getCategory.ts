import type { ApiResponse } from '@/lib/api';
import { getAniListMediaPage, mapAniListMediaToAnimeInfo } from '@/lib/anilist';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

export type CategoryResults = {
  data?: AnimeInfo[];
  totalPages?: number;
  [key: string]: unknown;
};

interface AniListCategoryParams {
  sort: string[];
  status?: string;
  format?: string;
}

function getAniListCategoryParams(name: string): AniListCategoryParams {
  switch (name) {
    case 'most-favorite':
      return { sort: ['FAVOURITES_DESC'] };
    case 'most-popular':
      return { sort: ['POPULARITY_DESC'] };
    case 'recently-updated':
      return { sort: ['UPDATED_AT_DESC'] };
    case 'recently-added':
      return { sort: ['START_DATE_DESC'] };
    case 'top-upcoming':
      return { sort: ['POPULARITY_DESC'], status: 'NOT_YET_RELEASED' };
    case 'top-airing':
      return { sort: ['POPULARITY_DESC'], status: 'RELEASING' };
    case 'movie':
      return { sort: ['POPULARITY_DESC'], format: 'MOVIE' };
    case 'special':
      return { sort: ['POPULARITY_DESC'], format: 'SPECIAL' };
    case 'ova':
      return { sort: ['POPULARITY_DESC'], format: 'OVA' };
    case 'ona':
      return { sort: ['POPULARITY_DESC'], format: 'ONA' };
    case 'tv':
      return { sort: ['POPULARITY_DESC'], format: 'TV' };
    case 'completed':
      return { sort: ['SCORE_DESC'], status: 'FINISHED' };
    case 'subbed-anime':
    case 'dubbed-anime':
    default:
      return { sort: ['POPULARITY_DESC'] };
  }
}

export const getCategory = async (
  name: string,
  page: number = 1
): Promise<ApiResponse<CategoryResults>> => {
  const categoryParams = getAniListCategoryParams(name);
  const anilistPage = await getAniListMediaPage({
    page,
    perPage: 20,
    sort: categoryParams.sort,
    status: categoryParams.status,
    format: categoryParams.format,
  });

  return {
    results: {
      data: (anilistPage.media ?? []).map(mapAniListMediaToAnimeInfo),
      totalPages: anilistPage.pageInfo?.lastPage ?? 1,
    },
  };
};
