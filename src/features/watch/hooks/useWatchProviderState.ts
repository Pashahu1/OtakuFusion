import { useCallback, useState, useRef, useEffect } from 'react';
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
  const hydratedContinueProviderRef = useRef(false);

  useEffect(() => {
    hydratedContinueProviderRef.current = false;
    setWatchStreamProviderState(initialProvider ?? DEFAULT_WATCH_STREAM_PROVIDER);
    setStreamLangRevision(0);
  }, [animeId, initialProvider]);

  useEffect(() => {
    if (!initialProvider) return;
    if (hydratedContinueProviderRef.current) return;

    hydratedContinueProviderRef.current = true;
    setWatchStreamProviderState(initialProvider);
  }, [animeId, initialProvider]);

  const setWatchStreamProvider = useCallback((next: WatchStreamProvider) => {
    hydratedContinueProviderRef.current = true;
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
