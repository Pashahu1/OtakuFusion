import { useEffect } from 'react';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

interface UseWatchProviderGateInput {
  watchStreamProvider: WatchStreamProvider;
  setWatchStreamProvider: (next: WatchStreamProvider) => void;
  animeInfoLoading: boolean;
  providerCatalogPending: boolean;
  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
}

/** Fall back to animepahe when alternate catalog providers are not eligible. */
export function useWatchProviderGate({
  watchStreamProvider,
  setWatchStreamProvider,
  animeInfoLoading,
  providerCatalogPending,
  anilibertyLanguageMenuEligible,
  hikkaLanguageMenuEligible,
}: UseWatchProviderGateInput): void {
  useEffect(() => {
    if (watchStreamProvider === 'aniliberty') {
      if (animeInfoLoading || providerCatalogPending) return;
      if (anilibertyLanguageMenuEligible) return;
      setWatchStreamProvider('animepahe');
      return;
    }
    if (watchStreamProvider === 'hikka') {
      if (animeInfoLoading || providerCatalogPending) return;
      if (hikkaLanguageMenuEligible) return;
      setWatchStreamProvider('animepahe');
    }
  }, [
    watchStreamProvider,
    animeInfoLoading,
    providerCatalogPending,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    setWatchStreamProvider,
  ]);
}
