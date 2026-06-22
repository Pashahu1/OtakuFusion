import { useCallback, useState } from 'react';
import {
  DEFAULT_WATCH_STREAM_PROVIDER,
  type WatchStreamProvider,
} from '@/features/watch/lib/watch-provider';

export function useWatchProviderState(
  animeId: string,
  initialProvider?: WatchStreamProvider,
) {
  const [watchStreamProvider, setWatchStreamProviderState] = useState<WatchStreamProvider>(
    () => initialProvider ?? DEFAULT_WATCH_STREAM_PROVIDER,
  );
  const [streamLangRevision, setStreamLangRevision] = useState(0);
  const [trackedAnimeId, setTrackedAnimeId] = useState(animeId);
  const [hydratedContinueProvider, setHydratedContinueProvider] = useState(false);

  if (trackedAnimeId !== animeId && animeId.trim()) {
    setHydratedContinueProvider(false);
    setTrackedAnimeId(animeId);
    setWatchStreamProviderState(initialProvider ?? DEFAULT_WATCH_STREAM_PROVIDER);
    setStreamLangRevision(0);
  } else if (
    initialProvider &&
    !hydratedContinueProvider &&
    watchStreamProvider !== initialProvider
  ) {
    setHydratedContinueProvider(true);
    setWatchStreamProviderState(initialProvider);
  }

  const setWatchStreamProvider = useCallback((next: WatchStreamProvider) => {
    setWatchStreamProviderState((prev) => {
      if (prev === next) return prev;
      setStreamLangRevision((n) => n + 1);
      return next;
    });
  }, []);

  return {
    watchStreamProvider,
    setWatchStreamProvider,
    streamLangRevision,
    setStreamLangRevision,
  };
}
