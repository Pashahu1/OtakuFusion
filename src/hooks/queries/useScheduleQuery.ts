'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { STALE_TIME } from '@/lib/query/stale-time';
import { getNextEpisodesAnime } from '@/lib/api/schedule';

export function useScheduleQuery(date: string) {
  return useQuery({
    queryKey: queryKeys.schedule(date),
    queryFn: () => getNextEpisodesAnime(date),
    enabled: date.length > 0,
    staleTime: STALE_TIME.schedule,
    placeholderData: keepPreviousData,
  });
}
