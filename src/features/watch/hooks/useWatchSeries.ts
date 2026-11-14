'use client';

import { useWatchAnime } from './useWatchAnime';
import { useWatchProviderState } from './useWatchProviderState';
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

  return anime;
}
