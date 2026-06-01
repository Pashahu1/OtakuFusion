import { useCallback, useEffect, useState } from 'react';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

export function useWatchProviderState(animeId: string) {
  const [watchStreamProvider, setWatchStreamProviderState] =
    useState<WatchStreamProvider>('animepahe');
  const [streamLangRevision, setStreamLangRevision] = useState(0);

  const setWatchStreamProvider = useCallback((next: WatchStreamProvider) => {
    setWatchStreamProviderState((prev) => {
      if (prev === next) return prev;
      setStreamLangRevision((n) => n + 1);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!animeId.trim()) return;
    setWatchStreamProvider('animepahe');
  }, [animeId, setWatchStreamProvider]);

  return {
    watchStreamProvider,
    setWatchStreamProvider,
    streamLangRevision,
    setStreamLangRevision,
  };
}
