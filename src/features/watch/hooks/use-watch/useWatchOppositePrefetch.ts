import { useEffect } from 'react';

import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

interface UseWatchOppositePrefetchInput {
  animeId: string;
  watchStreamProvider: WatchStreamProvider;
  animeInfo: unknown;
  animeInfoLoading: boolean;
  streamUrl: string | null;
  runDeferredOppositeProviderPrefetch: () => void;
}

export function useWatchOppositePrefetch({
  animeId,
  watchStreamProvider,
  animeInfo,
  animeInfoLoading,
  streamUrl,
  runDeferredOppositeProviderPrefetch,
}: UseWatchOppositePrefetchInput): void {
  useEffect(() => {
    if (!animeInfo || animeInfoLoading) return;
    runDeferredOppositeProviderPrefetch();
  }, [
    animeInfo,
    animeInfoLoading,
    animeId,
    runDeferredOppositeProviderPrefetch,
  ]);

  useEffect(() => {
    if (!streamUrl) return;
    runDeferredOppositeProviderPrefetch();
  }, [streamUrl, animeId, runDeferredOppositeProviderPrefetch]);
}
