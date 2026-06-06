import { useEffect } from 'react';
import {
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
  anikotoLanguageMenuEligible: boolean;
}

/** Cascade when the active provider has no catalog (Anikoto → Hikka → Anilibria). */
export function useWatchProviderGate({
  watchStreamProvider,
  setWatchStreamProvider,
  animeInfoLoading,
  providerCatalogPending,
  error,
  anilibertyLanguageMenuEligible,
  hikkaLanguageMenuEligible,
  anikotoLanguageMenuEligible,
}: UseWatchProviderGateInput): void {
  useEffect(() => {
    if (animeInfoLoading || providerCatalogPending) return;

    if (watchStreamProvider === 'anikoto' && !anikotoLanguageMenuEligible) {
      let fallback: WatchStreamProvider | null = nextWatchStreamProvider('anikoto');
      while (fallback) {
        if (fallback === 'hikka' && hikkaLanguageMenuEligible) {
          setWatchStreamProvider('hikka');
          break;
        }
        if (fallback === 'aniliberty' && anilibertyLanguageMenuEligible) {
          setWatchStreamProvider('aniliberty');
          break;
        }
        fallback = nextWatchStreamProvider(fallback);
      }
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
    anikotoLanguageMenuEligible,
    setWatchStreamProvider,
  ]);
}
