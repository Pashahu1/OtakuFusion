import { useCallback, useState, useRef, useEffect } from 'react';
import type { WatchPlaybackAudio } from '@/features/watch/lib/playback-audio';
import {
  DEFAULT_WATCH_STREAM_PROVIDER,
  normalizeWatchStreamProvider,
  type WatchStreamProvider,
} from '@/features/watch/lib/watch-provider';

export function useWatchProviderState(
  animeId: string,
  initialProvider?: WatchStreamProvider,
) {
  const [watchStreamProvider, setWatchStreamProviderState] = useState<WatchStreamProvider>(
    () =>
      initialProvider
        ? normalizeWatchStreamProvider(initialProvider)
        : DEFAULT_WATCH_STREAM_PROVIDER,
  );
  const [streamLangRevision, setStreamLangRevision] = useState(0);
  const [playbackAudio, setPlaybackAudioState] = useState<WatchPlaybackAudio>('ja');
  const hydratedContinueProviderRef = useRef(false);

  useEffect(() => {
    hydratedContinueProviderRef.current = false;
    setWatchStreamProviderState(
      initialProvider
        ? normalizeWatchStreamProvider(initialProvider)
        : DEFAULT_WATCH_STREAM_PROVIDER,
    );
    setPlaybackAudioState('ja');
    setStreamLangRevision(0);
  }, [animeId, initialProvider]);

  useEffect(() => {
    if (!initialProvider) return;
    if (hydratedContinueProviderRef.current) return;

    hydratedContinueProviderRef.current = true;
    setWatchStreamProviderState(normalizeWatchStreamProvider(initialProvider));
  }, [animeId, initialProvider]);

  const setWatchStreamProvider = useCallback((next: WatchStreamProvider) => {
    hydratedContinueProviderRef.current = true;
    const coerced = normalizeWatchStreamProvider(next);
    setWatchStreamProviderState((prev) => {
      if (prev === coerced) return prev;
      setStreamLangRevision((n) => n + 1);
      return coerced;
    });
  }, []);

  const setPlaybackAudio = useCallback((next: WatchPlaybackAudio) => {
    setPlaybackAudioState((prev) => {
      if (prev === next) return prev;
      setStreamLangRevision((n) => n + 1);
      return next;
    });
  }, []);

  return {
    watchStreamProvider,
    setWatchStreamProvider,
    playbackAudio,
    setPlaybackAudio,
    streamLangRevision,
    setStreamLangRevision,
  };
}
