'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { STALE_TIME } from '@/lib/query/stale-time';
import { getHomePage } from '@/services/getHomePage';

/**
 * Client-side home cache. `HomeContent` stays RSC today (better LCP);
 * use this hook for client-nav / prefetch when needed, without touching watch.
 */
export function useHomePageQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.homePage,
    queryFn: getHomePage,
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME.homePage,
  });
}
