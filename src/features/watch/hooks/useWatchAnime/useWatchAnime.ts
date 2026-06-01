import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import { episodeMatchesSelection } from '@/shared/utils/episodeUtils';
import {
  readWatchCatalogSessionCache,
  writeWatchCatalogSessionCache,
} from '@/features/watch/lib/watch-catalog-session-cache';
import {
  applyWatchAnimeHydratedState,
  readWatchAnimeHydratedState,
} from '@/features/watch/lib/watch-catalog-session-hydrate';
import type { UseWatchAnimeReturn, WarmAlternateCatalogEntry } from './types';
import { useWatchAnimeCatalogLoad } from './useWatchAnimeCatalogLoad';
import { useWatchAnimeDeferredPrefetch } from './useWatchAnimeDeferredPrefetch';

export type { UseWatchAnimeReturn } from './types';

function createInitialWatchAnimeState(
  animeId: string,
  watchStreamProvider: WatchStreamProvider,
  initialEpisodeId: string | undefined
) {
  const hydrated = readWatchAnimeHydratedState(animeId, watchStreamProvider, initialEpisodeId);
  if (!hydrated) {
    return {
      animeInfo: null as AnimeData | null,
      episodes: null as EpisodesTypes[] | null,
      animepaheCatalogProviderId: null as string | null,
      anilibertyCatalogProviderId: null as string | null,
      hikkaCatalogProviderId: null as string | null,
      totalEpisodes: null as number | null,
      episodeId: null as string | null,
      animeInfoLoading: false,
      nextEpisodeSchedule: null as NextEpisodeScheduleResult | null,
      anilibertyLanguageMenuEligible: false,
      hikkaLanguageMenuEligible: false,
      providerCatalogPending: false,
      episodesSourceProvider: null as WatchStreamProvider | null,
    };
  }

  return {
    animeInfo: hydrated.animeInfo,
    episodes: hydrated.episodes,
    animepaheCatalogProviderId: hydrated.animepaheCatalogProviderId,
    anilibertyCatalogProviderId: hydrated.anilibertyCatalogProviderId,
    hikkaCatalogProviderId: hydrated.hikkaCatalogProviderId,
    totalEpisodes: hydrated.totalEpisodes,
    episodeId: hydrated.episodeId,
    animeInfoLoading: false,
    nextEpisodeSchedule: hydrated.nextEpisodeSchedule,
    anilibertyLanguageMenuEligible: hydrated.anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible: hydrated.hikkaLanguageMenuEligible,
    providerCatalogPending: false,
    episodesSourceProvider: hydrated.episodesSourceProvider,
  };
}

export function useWatchAnime(
  animeId: string,
  initialEpisodeId: string | undefined,
  watchStreamProvider: WatchStreamProvider
): UseWatchAnimeReturn {
  const initialStateRef = useRef(
    createInitialWatchAnimeState(animeId, watchStreamProvider, initialEpisodeId)
  );
  const initial = initialStateRef.current;

  const [animeInfo, setAnimeInfo] = useState<AnimeData | null>(initial.animeInfo);
  const [episodes, setEpisodes] = useState<EpisodesTypes[] | null>(initial.episodes);
  const [animepaheCatalogProviderId, setAnimepaheCatalogProviderId] = useState<string | null>(
    initial.animepaheCatalogProviderId
  );
  const [anilibertyCatalogProviderId, setAnilibertyCatalogProviderId] = useState<string | null>(
    initial.anilibertyCatalogProviderId
  );
  const [totalEpisodes, setTotalEpisodes] = useState<number | null>(initial.totalEpisodes);
  const [episodeId, setEpisodeId] = useState<string | null>(initial.episodeId);
  const [animeInfoLoading, setAnimeInfoLoading] = useState(initial.animeInfoLoading);
  const [nextEpisodeSchedule, setNextEpisodeSchedule] = useState<NextEpisodeScheduleResult | null>(
    initial.nextEpisodeSchedule
  );
  const [error, setError] = useState<string | null>(null);
  const [anilibertyLanguageMenuEligible, setAnilibertyLanguageMenuEligible] = useState(
    initial.anilibertyLanguageMenuEligible
  );
  const [hikkaLanguageMenuEligible, setHikkaLanguageMenuEligible] = useState(
    initial.hikkaLanguageMenuEligible
  );
  const [hikkaCatalogProviderId, setHikkaCatalogProviderId] = useState<string | null>(
    initial.hikkaCatalogProviderId
  );
  const [providerCatalogPending, setProviderCatalogPending] = useState(
    initial.providerCatalogPending
  );
  const [episodesSourceProvider, setEpisodesSourceProvider] = useState<WatchStreamProvider | null>(
    initial.episodesSourceProvider
  );

  const initialEpisodeRef = useRef(initialEpisodeId);
  initialEpisodeRef.current = initialEpisodeId;

  const deferredOppositePrefetchRef = useRef<{
    animeId: string;
    data: AnimeData;
    provider: WatchStreamProvider;
  } | null>(null);
  const oppositePrefetchDoneRef = useRef<string | null>(null);
  const oppositePrefetchAbortRef = useRef<AbortController | null>(null);
  const alternateWarmupAbortRef = useRef<AbortController | null>(null);
  const warmCatalogsRef = useRef<WarmAlternateCatalogEntry | null>(null);

  const [episodeRemapPass, setEpisodeRemapPass] = useState(0);

  const animeInfoRef = useRef(animeInfo);
  animeInfoRef.current = animeInfo;
  const episodeIdRef = useRef(episodeId);
  episodeIdRef.current = episodeId;
  const stableWatchLoad = useRef<{
    animeId: string;
    remap: number;
    provider: WatchStreamProvider;
  } | null>(null);

  useEffect(() => {
    setEpisodeRemapPass(0);
  }, [animeId]);

  useLayoutEffect(() => {
    oppositePrefetchAbortRef.current?.abort();
    oppositePrefetchAbortRef.current = null;
    alternateWarmupAbortRef.current?.abort();
    alternateWarmupAbortRef.current = null;
    oppositePrefetchDoneRef.current = null;

    const cached = readWatchCatalogSessionCache(animeId, watchStreamProvider);
    if (cached) {
      warmCatalogsRef.current = cached.warmCatalogs;
      stableWatchLoad.current = cached.stableWatchLoad;
      deferredOppositePrefetchRef.current = {
        animeId: cached.animeId,
        data: cached.animeInfo,
        provider: watchStreamProvider,
      };
      const hydrated = readWatchAnimeHydratedState(
        animeId,
        watchStreamProvider,
        initialEpisodeRef.current
      );
      if (!hydrated) return;

      applyWatchAnimeHydratedState(hydrated, {
        setAnimeInfo,
        setEpisodes,
        setNextEpisodeSchedule,
        setAnimepaheCatalogProviderId,
        setAnilibertyCatalogProviderId,
        setHikkaCatalogProviderId,
        setTotalEpisodes,
        setEpisodeId,
        setAnilibertyLanguageMenuEligible,
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
    stableWatchLoad.current = null;

    setEpisodes(null);
    setAnimepaheCatalogProviderId(null);
    setAnilibertyCatalogProviderId(null);
    setEpisodeId(null);
    setAnimeInfo(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    setError(null);
    setAnilibertyLanguageMenuEligible(false);
    setHikkaLanguageMenuEligible(false);
    setHikkaCatalogProviderId(null);
    setProviderCatalogPending(false);
    setEpisodesSourceProvider(null);
    setNextEpisodeSchedule(null);
  }, [animeId, watchStreamProvider]);

  useLayoutEffect(() => {
    const s = stableWatchLoad.current;
    if (!s || s.animeId !== animeId || s.provider === watchStreamProvider) return;
    setEpisodesSourceProvider(null);
  }, [animeId, watchStreamProvider]);

  const runDeferredOppositeProviderPrefetch = useWatchAnimeDeferredPrefetch({
    animeId,
    warmCatalogsRef,
    deferredOppositePrefetchRef,
    oppositePrefetchDoneRef,
    oppositePrefetchAbortRef,
    setAnimepaheCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
  });

  useWatchAnimeCatalogLoad({
    animeId,
    episodeRemapPass,
    watchStreamProvider,
    initialEpisodeRef,
    animeInfoRef,
    episodeIdRef,
    stableWatchLoad,
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
  });

  useEffect(() => {
    if (animeInfoLoading || providerCatalogPending) return;
    if (!animeInfo || !episodes?.length) return;
    const stable = stableWatchLoad.current;
    const id = animeId.trim();
    if (!stable || stable.animeId !== id || stable.provider !== watchStreamProvider) return;

    writeWatchCatalogSessionCache({
      animeId: id,
      watchStreamProvider,
      cachedAt: Date.now(),
      animeInfo,
      episodes,
      nextEpisodeSchedule,
      animepaheCatalogProviderId,
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
    animepaheCatalogProviderId,
    anilibertyCatalogProviderId,
    hikkaCatalogProviderId,
    totalEpisodes,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    episodesSourceProvider,
    animeInfoLoading,
    providerCatalogPending,
  ]);

  useEffect(() => {
    if (!animeId.trim() || animeInfoLoading || !episodes?.length) return;
    if (!initialEpisodeId) return;
    if (!episodes.some((ep) => episodeMatchesSelection(ep, initialEpisodeId))) return;

    if (episodeId != null) {
      const currentEpisode = episodes.find((ep) => episodeMatchesSelection(ep, episodeId));
      if (currentEpisode && episodeMatchesSelection(currentEpisode, initialEpisodeId)) {
        return;
      }
    }

    setEpisodeId(initialEpisodeId);
  }, [animeId, initialEpisodeId, episodes, animeInfoLoading, episodeId]);

  const providerAnimeId =
    watchStreamProvider === 'aniliberty'
      ? anilibertyCatalogProviderId
      : watchStreamProvider === 'hikka'
        ? hikkaCatalogProviderId
        : animepaheCatalogProviderId;

  return {
    animeInfo,
    animepaheCatalogProviderId,
    anilibertyCatalogProviderId,
    hikkaCatalogProviderId,
    providerAnimeId,
    episodes,
    totalEpisodes,
    episodeId,
    setEpisodeId,
    animeInfoLoading,
    nextEpisodeSchedule,
    error,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    providerCatalogPending,
    episodesSourceProvider,
    runDeferredOppositeProviderPrefetch,
  };
}
