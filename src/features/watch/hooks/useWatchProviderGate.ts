import { useEffect } from 'react';
import {
  DEFAULT_WATCH_STREAM_PROVIDER,
  type WatchStreamProvider,
} from '@/features/watch/lib/watch-provider';
import {
  catalogErrorBelongsToProvider,
  nextWatchStreamProvider,
  priorWatchStreamProvider,
} from '@/features/watch/lib/watch-provider-fallback';

interface UseWatchProviderGateInput {
  watchStreamProvider: WatchStreamProvider;
  setWatchStreamProvider: (next: WatchStreamProvider) => void;
  animeInfoLoading: boolean;
  providerCatalogPending: boolean;
  error: string | null;
  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
}

/** Cascade: Hikka ↔ Aniliberty when the active provider has no catalog. */
export function useWatchProviderGate({
  watchStreamProvider,
  setWatchStreamProvider,
  animeInfoLoading,
  providerCatalogPending,
  error,
  anilibertyLanguageMenuEligible,
  hikkaLanguageMenuEligible,
}: UseWatchProviderGateInput): void {
  useEffect(() => {
    if (animeInfoLoading || providerCatalogPending) return;

    if (watchStreamProvider === 'animepahe') {
      setWatchStreamProvider(DEFAULT_WATCH_STREAM_PROVIDER);
      return;
    }

    const staleErr = error?.trim() ?? '';

    if (watchStreamProvider === 'aniliberty' && !anilibertyLanguageMenuEligible) {
      if (staleErr && catalogErrorBelongsToProvider(staleErr, 'hikka')) {
        return;
      }
      const stepBack = priorWatchStreamProvider('aniliberty');
      if (stepBack === 'hikka' && hikkaLanguageMenuEligible) {
        setWatchStreamProvider('hikka');
      }
      return;
    }

    if (watchStreamProvider === 'hikka' && !hikkaLanguageMenuEligible) {
      if (staleErr && !catalogErrorBelongsToProvider(staleErr, 'hikka')) {
        return;
      }
      const stepForward = nextWatchStreamProvider('hikka');
      if (stepForward === 'aniliberty' && anilibertyLanguageMenuEligible) {
        setWatchStreamProvider('aniliberty');
      }
    }
  }, [
    watchStreamProvider,
    animeInfoLoading,
    providerCatalogPending,
    error,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    setWatchStreamProvider,
  ]);
}
