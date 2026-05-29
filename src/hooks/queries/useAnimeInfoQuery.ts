'use client';

import { useQuery, type QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { STALE_TIME } from '@/lib/query/stale-time';
import { getAnimeInfo } from '@/services/getAnimeInfo';

interface UseAnimeInfoQueryOptions {
  enabled?: boolean;
}

/** AniList title metadata. Not wired to `useWatchAnime` — for other screens / prefetch only. */
export function useAnimeInfoQuery(animeId: string, options?: UseAnimeInfoQueryOptions) {
  const enabled = (options?.enabled ?? true) && animeId.length > 0;

  return useQuery({
    queryKey: queryKeys.animeInfo(animeId),
    queryFn: () => getAnimeInfo(animeId),
    enabled,
    staleTime: STALE_TIME.animeInfo,
  });
}

export function prefetchAnimeInfo(queryClient: QueryClient, animeId: string) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.animeInfo(animeId),
    queryFn: () => getAnimeInfo(animeId),
    staleTime: STALE_TIME.animeInfo,
  });
}
