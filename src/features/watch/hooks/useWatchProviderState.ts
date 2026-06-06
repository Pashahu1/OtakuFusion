import { useCallback, useState } from 'react';
import {
  DEFAULT_WATCH_STREAM_PROVIDER,
  type WatchStreamProvider,
} from '@/features/watch/lib/watch-provider';

export function useWatchProviderState(animeId: string) {
  const [watchStreamProvider, setWatchStreamProviderState] =
    useState<WatchStreamProvider>(DEFAULT_WATCH_STREAM_PROVIDER);
  const [streamLangRevision, setStreamLangRevision] = useState(0);
  const [trackedAnimeId, setTrackedAnimeId] = useState(animeId);

  if (trackedAnimeId !== animeId && animeId.trim()) {
    setTrackedAnimeId(animeId);
    setWatchStreamProviderState(DEFAULT_WATCH_STREAM_PROVIDER);
    setStreamLangRevision(0);
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
