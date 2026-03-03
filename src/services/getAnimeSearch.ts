import { apiUrl, type ApiResponse } from '@/lib/api';
import type { AnimeSearchItems } from '@/shared/types/AnimeSearchTypes';

type SearchResults = AnimeSearchItems[] | { data: AnimeSearchItems[] };

export const getAnimeSearch = async (
  query: string
): Promise<AnimeSearchItems[]> => {
  const data = await apiUrl.get<ApiResponse<SearchResults>>(
    `/search?keyword=${query}`
  );
  const results = data.results;
  return Array.isArray(results) ? results : results.data ?? [];
};
