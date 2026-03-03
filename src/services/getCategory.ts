import { apiUrl, type ApiResponse } from '@/lib/api';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

export type CategoryResults = {
  data?: AnimeInfo[];
  totalPages?: number;
  [key: string]: unknown;
};

export const getCategory = async (
  name: string,
  page: number = 1
): Promise<ApiResponse<CategoryResults>> => {
  const data = await apiUrl.get<ApiResponse<CategoryResults>>(
    `/${name}?page=${page}`
  );
  return data;
};
