import { useEffect } from 'react';

import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import { writeWatchCatalogSessionCache } from '@/features/watch/lib/watch-catalog-session-cache';

import type { WatchAnimeState } from './useWatchAnimeState';

interface UseWatchAnimeSessionCacheWriteParams {
  animeId: string;
  watchStreamProvider: WatchStreamProvider;
  state: WatchAnimeState;
}

export function useWatchAnimeSessionCacheWrite({
  animeId,
  watchStreamProvider,
  state,
}: UseWatchAnimeSessionCacheWriteParams) {
  const {
    animeInfo,
    episodes,
    nextEpisodeSchedule,
    anilibertyCatalogProviderId,
    hikkaCatalogProviderId,
    totalEpisodes,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    episodesSourceProvider,
    animeInfoLoading,
    providerCatalogPending,
    warmCatalogsRef,
    stableWatchLoadRef,
  } = state;

  useEffect(() => {
    if (animeInfoLoading || providerCatalogPending) return;
    if (!animeInfo || !episodes?.length) return;
    const stable = stableWatchLoadRef.current;
    const id = animeId.trim();
    if (!stable || stable.animeId !== id || stable.provider !== watchStreamProvider) return;

    writeWatchCatalogSessionCache({
      animeId: id,
      watchStreamProvider,
      cachedAt: Date.now(),
      animeInfo,
      episodes,
      nextEpisodeSchedule,
      anilibertyCatalogProviderId,
      hikkaCatalogProviderId,
      totalEpisodes,
      anilibertyLanguageMenuEligible,
      hikkaLanguageMenuEligible,
      episodesSourceProvider,
      stableWatchLoad: stable,
      warmCatalogs: warmCatalogsRef.current,
    });
  }, [
    animeId,
    watchStreamProvider,
    animeInfo,
    episodes,
    nextEpisodeSchedule,
    anilibertyCatalogProviderId,
    hikkaCatalogProviderId,
    totalEpisodes,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    episodesSourceProvider,
    animeInfoLoading,
    providerCatalogPending,
    stableWatchLoadRef,
    warmCatalogsRef,
  ]);
}
