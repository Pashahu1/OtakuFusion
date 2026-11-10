import { useEffect } from 'react';
import {
  ANIKOTO_PLAYBACK_ENABLED,
  type WatchStreamProvider,
} from '@/features/watch/lib/watch-provider';
import { nextWatchStreamProvider } from '@/features/watch/lib/watch-provider-fallback';

interface UseWatchProviderGateInput {
  watchStreamProvider: WatchStreamProvider;
  setWatchStreamProvider: (next: WatchStreamProvider) => void;
  animeInfoLoading: boolean;
  providerCatalogPending: boolean;
  hikkaLanguageMenuEligible: boolean;
  anikotoLanguageMenuEligible: boolean;
}

/** Cascade when the active provider has no catalog (Anikoto → Hikka). */
export function useWatchProviderGate({
  watchStreamProvider,
  setWatchStreamProvider,
  animeInfoLoading,
  providerCatalogPending,
  hikkaLanguageMenuEligible,
  anikotoLanguageMenuEligible,
}: UseWatchProviderGateInput): void {
  useEffect(() => {
    if (animeInfoLoading || providerCatalogPending) return;

    if (
      watchStreamProvider === 'anikoto' &&
      (!ANIKOTO_PLAYBACK_ENABLED || !anikotoLanguageMenuEligible)
    ) {
      let fallback: WatchStreamProvider | null = nextWatchStreamProvider('anikoto');
      while (fallback) {
        if (fallback === 'hikka' && hikkaLanguageMenuEligible) {
          setWatchStreamProvider('hikka');
          break;
        }
        fallback = nextWatchStreamProvider(fallback);
      }
    }
  }, [
    watchStreamProvider,
    animeInfoLoading,
    providerCatalogPending,
    hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible,
    setWatchStreamProvider,
  ]);
}
