import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

import { resolveProviderAnimeId } from './resolveProviderAnimeId';
import type { UseWatchAnimeReturn } from './types';
import { useWatchAnimeCacheHydration } from './useWatchAnimeCacheHydration';
import { useWatchAnimeCatalogLoad } from './useWatchAnimeCatalogLoad';
import { useWatchAnimeDeferredPrefetch } from './useWatchAnimeDeferredPrefetch';
import { useWatchAnimeInitialEpisodeSync } from './useWatchAnimeInitialEpisodeSync';
import { useWatchAnimeSessionCacheWrite } from './useWatchAnimeSessionCacheWrite';
import { useWatchAnimeState } from './useWatchAnimeState';

export type { UseWatchAnimeReturn } from './types';

export function useWatchAnime(
  animeId: string,
  initialEpisodeId: string | undefined,
  watchStreamProvider: WatchStreamProvider,
): UseWatchAnimeReturn {
  const state = useWatchAnimeState(animeId, initialEpisodeId, watchStreamProvider);

  useWatchAnimeCacheHydration({ animeId, watchStreamProvider, state });
  useWatchAnimeSessionCacheWrite({ animeId, watchStreamProvider, state });
  useWatchAnimeInitialEpisodeSync({ animeId, initialEpisodeId, state });

  const runDeferredOppositeProviderPrefetch = useWatchAnimeDeferredPrefetch({
    animeId,
    warmCatalogsRef: state.warmCatalogsRef,
    deferredOppositePrefetchRef: state.deferredOppositePrefetchRef,
    oppositePrefetchDoneRef: state.oppositePrefetchDoneRef,
    oppositePrefetchAbortRef: state.oppositePrefetchAbortRef,
    setAnilibertyLanguageMenuEligible: state.setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible: state.setHikkaLanguageMenuEligible,
    setAnikotoLanguageMenuEligible: state.setAnikotoLanguageMenuEligible,
  });

  useWatchAnimeCatalogLoad({
    animeId,
    episodeRemapPass: state.episodeRemapPass,
    watchStreamProvider,
    initialEpisodeRef: state.initialEpisodeRef,
    animeInfoRef: state.animeInfoRef,
    episodeIdRef: state.episodeIdRef,
    stableWatchLoadRef: state.stableWatchLoadRef,
    warmCatalogsRef: state.warmCatalogsRef,
    deferredOppositePrefetchRef: state.deferredOppositePrefetchRef,
    oppositePrefetchDoneRef: state.oppositePrefetchDoneRef,
    alternateWarmupAbortRef: state.alternateWarmupAbortRef,
    setAnimeInfo: state.setAnimeInfo,
    setEpisodes: state.setEpisodes,
    setAnilibertyCatalogProviderId: state.setAnilibertyCatalogProviderId,
    setHikkaCatalogProviderId: state.setHikkaCatalogProviderId,
    setAnikotoCatalogProviderId: state.setAnikotoCatalogProviderId,
    setTotalEpisodes: state.setTotalEpisodes,
    setEpisodeId: state.setEpisodeId,
    setAnimeInfoLoading: state.setAnimeInfoLoading,
    setNextEpisodeSchedule: state.setNextEpisodeSchedule,
    setError: state.setError,
    setAnilibertyLanguageMenuEligible: state.setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible: state.setHikkaLanguageMenuEligible,
    setAnikotoLanguageMenuEligible: state.setAnikotoLanguageMenuEligible,
    setProviderCatalogPending: state.setProviderCatalogPending,
    setEpisodesSourceProvider: state.setEpisodesSourceProvider,
    setEpisodeRemapPass: state.setEpisodeRemapPass,
  });

  const providerAnimeId = resolveProviderAnimeId(watchStreamProvider, {
    anilibertyCatalogProviderId: state.anilibertyCatalogProviderId,
    hikkaCatalogProviderId: state.hikkaCatalogProviderId,
    anikotoCatalogProviderId: state.anikotoCatalogProviderId,
  });

  return {
    animeInfo: state.animeInfo,
    anilibertyCatalogProviderId: state.anilibertyCatalogProviderId,
    hikkaCatalogProviderId: state.hikkaCatalogProviderId,
    anikotoCatalogProviderId: state.anikotoCatalogProviderId,
    providerAnimeId,
    episodes: state.episodes,
    totalEpisodes: state.totalEpisodes,
    episodeId: state.episodeId,
    setEpisodeId: state.setEpisodeId,
    animeInfoLoading: state.animeInfoLoading,
    nextEpisodeSchedule: state.nextEpisodeSchedule,
    error: state.error,
    anilibertyLanguageMenuEligible: state.anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible: state.hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible: state.anikotoLanguageMenuEligible,
    providerCatalogPending: state.providerCatalogPending,
    episodesSourceProvider: state.episodesSourceProvider,
    runDeferredOppositeProviderPrefetch,
  };
}
