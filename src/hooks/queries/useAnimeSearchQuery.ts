'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { STALE_TIME } from '@/lib/query/stale-time';
import {
  ANIME_SEARCH_MIN_QUERY_LENGTH,
  getAnimeSearch,
} from '@/services/getAnimeSearch';

interface UseAnimeSearchQueryOptions {
  enabled?: boolean;
}

export function useAnimeSearchQuery(
  keyword: string,
  options?: UseAnimeSearchQueryOptions,
) {
  const trimmed = keyword.trim();
  const meetsMinLength = trimmed.length >= ANIME_SEARCH_MIN_QUERY_LENGTH;

  return useQuery({
    queryKey: queryKeys.animeSearch(trimmed),
    queryFn: () => getAnimeSearch(trimmed),
    enabled: (options?.enabled ?? true) && meetsMinLength,
    staleTime: STALE_TIME.animeSearch,
    placeholderData: keepPreviousData,
  });
}
