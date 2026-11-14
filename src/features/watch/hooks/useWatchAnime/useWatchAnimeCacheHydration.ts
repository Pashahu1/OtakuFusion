import { useEffect, useLayoutEffect } from 'react';

import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import {
  applyWatchAnimeHydratedState,
  readWatchAnimeHydratedState,
} from '@/features/watch/lib/watch-catalog-session-hydrate';
import { readWatchCatalogSessionCache } from '@/features/watch/lib/watch-catalog-session-cache';

import type { WatchAnimeState } from './useWatchAnimeState';
import { resetWatchAnimeLoadState } from './watchAnimeInitialState';

interface UseWatchAnimeCacheHydrationParams {
  animeId: string;
  watchStreamProvider: WatchStreamProvider;
  state: WatchAnimeState;
}

export function useWatchAnimeCacheHydration({
  animeId,
  watchStreamProvider,
  state,
}: UseWatchAnimeCacheHydrationParams) {
  const {
    initialEpisodeRef,
    deferredOppositePrefetchRef,
    oppositePrefetchDoneRef,
    oppositePrefetchAbortRef,
    alternateWarmupAbortRef,
    warmCatalogsRef,
    stableWatchLoadRef,
    setEpisodeRemapPass,
    setAnimeInfo,
    setEpisodes,
    setNextEpisodeSchedule,
    setHikkaCatalogProviderId,
    setTotalEpisodes,
    setEpisodeId,
    setHikkaLanguageMenuEligible,
    setAnikotoCatalogProviderId,
    setAnikotoLanguageMenuEligible,
    setEpisodesSourceProvider,
    setAnimeInfoLoading,
    setProviderCatalogPending,
    setError,
  } = state;

  useEffect(() => {
    setEpisodeRemapPass(0);
  }, [animeId, setEpisodeRemapPass]);

  useLayoutEffect(() => {
    oppositePrefetchAbortRef.current?.abort();
    oppositePrefetchAbortRef.current = null;
    alternateWarmupAbortRef.current?.abort();
    alternateWarmupAbortRef.current = null;
    oppositePrefetchDoneRef.current = null;

    const cached = readWatchCatalogSessionCache(animeId, watchStreamProvider);
    if (cached) {
      warmCatalogsRef.current = cached.warmCatalogs;
      stableWatchLoadRef.current = cached.stableWatchLoad;
      deferredOppositePrefetchRef.current = {
        animeId: cached.animeId,
        data: cached.animeInfo,
        provider: watchStreamProvider,
      };
      const hydrated = readWatchAnimeHydratedState(
        animeId,
        watchStreamProvider,
        initialEpisodeRef.current,
      );
      if (!hydrated) return;

      applyWatchAnimeHydratedState(hydrated, {
        setAnimeInfo,
        setEpisodes,
        setNextEpisodeSchedule,
        setHikkaCatalogProviderId,
        setTotalEpisodes,
        setEpisodeId,
        setHikkaLanguageMenuEligible,
        setEpisodesSourceProvider,
        setAnimeInfoLoading,
        setProviderCatalogPending,
        setError,
      });
      return;
    }

    deferredOppositePrefetchRef.current = null;
    warmCatalogsRef.current = null;
    stableWatchLoadRef.current = null;

    resetWatchAnimeLoadState({
      setEpisodes,
      setEpisodeId,
      setAnimeInfo,
      setTotalEpisodes,
      setAnimeInfoLoading,
      setError,
      setHikkaLanguageMenuEligible,
      setHikkaCatalogProviderId,
      setProviderCatalogPending,
      setEpisodesSourceProvider,
      setNextEpisodeSchedule,
    });
  }, [
    animeId,
    watchStreamProvider,
    alternateWarmupAbortRef,
    deferredOppositePrefetchRef,
    initialEpisodeRef,
    oppositePrefetchAbortRef,
    oppositePrefetchDoneRef,
    setAnimeInfo,
    setAnimeInfoLoading,
    setHikkaLanguageMenuEligible,
    setHikkaCatalogProviderId,
    setAnikotoCatalogProviderId,
    setAnikotoLanguageMenuEligible,
    setNextEpisodeSchedule,
    setProviderCatalogPending,
    setTotalEpisodes,
    setEpisodeId,
    setEpisodes,
    setEpisodesSourceProvider,
    setError,
    stableWatchLoadRef,
    warmCatalogsRef,
  ]);

  useLayoutEffect(() => {
    const s = stableWatchLoadRef.current;
    if (!s || s.animeId !== animeId || s.provider === watchStreamProvider) return;
    setEpisodesSourceProvider(null);
  }, [animeId, watchStreamProvider, setEpisodesSourceProvider, stableWatchLoadRef]);
}
