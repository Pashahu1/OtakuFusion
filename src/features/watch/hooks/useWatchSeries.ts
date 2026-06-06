'use client';

import { useWatchAnime } from './useWatchAnime';
import { useWatchProviderState } from './useWatchProviderState';
import { useWatchProviderGate } from './useWatchProviderGate';
import { useWatchCatalogProviderFallback } from './useWatchCatalogProviderFallback';

/** Loads anime metadata and episode catalog only (no stream / player). */
export function useWatchSeries(animeId: string, highlightEpisode?: string) {
  const { watchStreamProvider, setWatchStreamProvider } =
    useWatchProviderState(animeId);

  const anime = useWatchAnime(animeId, highlightEpisode, watchStreamProvider);

  useWatchCatalogProviderFallback({
    animeId,
    watchStreamProvider,
    error: anime.error,
    providerCatalogPending: anime.providerCatalogPending,
    setWatchStreamProvider,
  });

  useWatchProviderGate({
    watchStreamProvider,
    setWatchStreamProvider,
    animeInfoLoading: anime.animeInfoLoading,
    providerCatalogPending: anime.providerCatalogPending,
    error: anime.error,
    anilibertyLanguageMenuEligible: anime.anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible: anime.hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible: anime.anikotoLanguageMenuEligible,
  });

  return anime;
}
