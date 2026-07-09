import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getNextEpisodesAnime } from '@/lib/api/schedule';
import { getQueryClient } from '@/lib/query/get-query-client';
import { queryKeys } from '@/lib/query/keys';
import { STALE_TIME } from '@/lib/query/stale-time';
import { getKyivScheduleDateString } from '@/lib/schedule/schedule-timezone';
import SchedulePageClient from './SchedulePageClient';

export default async function SchedulePage() {
  const initialDate = getKyivScheduleDateString();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.schedule(initialDate),
    queryFn: () => getNextEpisodesAnime(initialDate),
    staleTime: STALE_TIME.schedule,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SchedulePageClient initialDate={initialDate} />
    </HydrationBoundary>
  );
}
