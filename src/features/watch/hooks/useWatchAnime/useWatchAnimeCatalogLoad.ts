import { useEffect } from 'react';
import { runInitialWatchCatalogLoad } from './initialWatchCatalogLoad';
import { runProviderOnlyCatalogLoad } from './providerOnlyCatalogLoad';
import {
  buildWatchCatalogLoadEffectDeps,
  isProviderOnlyCatalogLoad,
} from './watchCatalogLoadDeps';
import type { WatchAnimeCatalogLoadParams } from './watchAnimeCatalogLoadTypes';

export type { WatchAnimeCatalogLoadParams } from './watchAnimeCatalogLoadTypes';

export function useWatchAnimeCatalogLoad(params: WatchAnimeCatalogLoadParams): void {
  const {
    animeId,
    episodeRemapPass,
    watchStreamProvider,
    initialEpisodeRef,
    animeInfoRef,
    episodeIdRef,
    stableWatchLoadRef,
    warmCatalogsRef,
    deferredOppositePrefetchRef,
    oppositePrefetchDoneRef,
    alternateWarmupAbortRef,
    setAnimeInfo,
    setEpisodes,
    setAnimepaheCatalogProviderId,
    setAnilibertyCatalogProviderId,
    setHikkaCatalogProviderId,
    setTotalEpisodes,
    setEpisodeId,
    setAnimeInfoLoading,
    setNextEpisodeSchedule,
    setError,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
    setProviderCatalogPending,
    setEpisodesSourceProvider,
    setEpisodeRemapPass,
  } = params;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let cancelled = false;
    const isAborted = () => cancelled || signal.aborted;
    const markCancelled = () => {
      cancelled = true;
    };
    const abortSignal = () => controller.abort();

    const deps = buildWatchCatalogLoadEffectDeps(params, signal, isAborted);

    if (
      isProviderOnlyCatalogLoad(
        stableWatchLoadRef,
        animeId,
        episodeRemapPass,
        watchStreamProvider
      )
    ) {
      return runProviderOnlyCatalogLoad({
        deps,
        animeInfoRef,
        episodeIdRef,
        stableWatchLoadRef,
        warmCatalogsRef,
        setProviderCatalogPending,
        markCancelled,
        abortSignal,
      });
    }

    return runInitialWatchCatalogLoad({
      deps,
      episodeRemapPass,
      setAnimeInfo,
      setEpisodes,
      setAnimepaheCatalogProviderId,
      setAnilibertyCatalogProviderId,
      setHikkaCatalogProviderId,
      setTotalEpisodes,
      setEpisodeId,
      setAnimeInfoLoading,
      setNextEpisodeSchedule,
      setProviderCatalogPending,
      setAnilibertyLanguageMenuEligible,
      setHikkaLanguageMenuEligible,
      isCancelled: () => cancelled,
      markCancelled,
      abortSignal,
    });
  }, [
    animeId,
    episodeRemapPass,
    watchStreamProvider,
    alternateWarmupAbortRef,
    animeInfoRef,
    deferredOppositePrefetchRef,
    episodeIdRef,
    initialEpisodeRef,
    oppositePrefetchDoneRef,
    setAnimeInfo,
    setAnimeInfoLoading,
    setAnimepaheCatalogProviderId,
    setAnilibertyCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
    setEpisodeId,
    setEpisodeRemapPass,
    setEpisodes,
    setError,
    setHikkaCatalogProviderId,
    setHikkaLanguageMenuEligible,
    setNextEpisodeSchedule,
    setProviderCatalogPending,
    setEpisodesSourceProvider,
    setTotalEpisodes,
    stableWatchLoadRef,
    warmCatalogsRef,
  ]);
}
