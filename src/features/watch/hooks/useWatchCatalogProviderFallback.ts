import { useEffect, useRef } from 'react';

import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import {
  isCatalogFailureError,
  nextWatchStreamProvider,
} from '@/features/watch/lib/watch-provider-fallback';

interface UseWatchCatalogProviderFallbackInput {
  animeId: string;
  watchStreamProvider: WatchStreamProvider;
  error: string | null;
  providerCatalogPending: boolean;
  setWatchStreamProvider: (next: WatchStreamProvider) => void;
}

/** On catalog failure, advance Hikka → Aniliberty once per anime+provider. */
export function useWatchCatalogProviderFallback({
  animeId,
  watchStreamProvider,
  error,
  providerCatalogPending,
  setWatchStreamProvider,
}: UseWatchCatalogProviderFallbackInput): void {
  const issuedRef = useRef<string | null>(null);

  useEffect(() => {
    issuedRef.current = null;
  }, [animeId]);

  useEffect(() => {
    if (providerCatalogPending || !error?.trim()) return;
    if (!isCatalogFailureError(error, watchStreamProvider)) return;

    const token = `${animeId}:${watchStreamProvider}`;
    if (issuedRef.current === token) return;

    const next = nextWatchStreamProvider(watchStreamProvider);
    if (!next) return;

    issuedRef.current = token;
    setWatchStreamProvider(next);
  }, [
    animeId,
    watchStreamProvider,
    error,
    providerCatalogPending,
    setWatchStreamProvider,
  ]);
}
