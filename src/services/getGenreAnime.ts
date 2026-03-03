import { apiUrl, type ApiResponse } from '@/lib/api';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

export type GenreResults = {
  data?: AnimeInfo[];
  totalPages?: number;
  [key: string]: unknown;
};

export const getGenreAnime = async (
  name: string = 'most-popular',
  page: number = 1
): Promise<ApiResponse<GenreResults>> => {
  const data = await apiUrl.get<ApiResponse<GenreResults>>(
    `/genre/${name}?page=${page}`
  );
  return data;
};
