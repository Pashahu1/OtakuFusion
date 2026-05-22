import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import type { WatchStreamProvider } from '@/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import { episodeMatchesSelection } from '@/shared/utils/episodeUtils';
import type { UseWatchAnimeReturn, WarmAlternateCatalogEntry } from './types';
import { useWatchAnimeCatalogLoad } from './useWatchAnimeCatalogLoad';
import { useWatchAnimeDeferredPrefetch } from './useWatchAnimeDeferredPrefetch';

export type { UseWatchAnimeReturn } from './types';

export function useWatchAnime(
  animeId: string,
  initialEpisodeId: string | undefined,
  watchStreamProvider: WatchStreamProvider
): UseWatchAnimeReturn {
  const [animeInfo, setAnimeInfo] = useState<AnimeData | null>(null);
  const [episodes, setEpisodes] = useState<EpisodesTypes[] | null>(null);
  const [animepaheCatalogProviderId, setAnimepaheCatalogProviderId] = useState<string | null>(
    null
  );
  const [anilibertyCatalogProviderId, setAnilibertyCatalogProviderId] = useState<string | null>(
    null
  );
  const [totalEpisodes, setTotalEpisodes] = useState<number | null>(null);
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [animeInfoLoading, setAnimeInfoLoading] = useState(false);
  const [nextEpisodeSchedule, setNextEpisodeSchedule] =
    useState<NextEpisodeScheduleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [anilibertyLanguageMenuEligible, setAnilibertyLanguageMenuEligible] = useState(false);
  const [hikkaLanguageMenuEligible, setHikkaLanguageMenuEligible] = useState(false);
  const [hikkaCatalogProviderId, setHikkaCatalogProviderId] = useState<string | null>(null);
  const [providerCatalogPending, setProviderCatalogPending] = useState(false);
  const [episodesSourceProvider, setEpisodesSourceProvider] =
    useState<WatchStreamProvider | null>(null);

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

  useEffect(() => {
    setEpisodeRemapPass(0);
  }, [animeId]);

  useLayoutEffect(() => {
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
    deferredOppositePrefetchRef.current = null;
    oppositePrefetchDoneRef.current = null;
    oppositePrefetchAbortRef.current?.abort();
    oppositePrefetchAbortRef.current = null;
    alternateWarmupAbortRef.current?.abort();
    alternateWarmupAbortRef.current = null;
    warmCatalogsRef.current = null;
    stableWatchLoad.current = null;
  }, [animeId]);

  const animeInfoRef = useRef(animeInfo);
  animeInfoRef.current = animeInfo;
  const episodeIdRef = useRef(episodeId);
  episodeIdRef.current = episodeId;
  const stableWatchLoad = useRef<{
    animeId: string;
    remap: number;
    provider: WatchStreamProvider;
  } | null>(null);

  /** Синхронно скидає ep_token попереднього провайдера (без блокування Animepahe resolve). */
  useLayoutEffect(() => {
    const s = stableWatchLoad.current;
    if (!s || s.animeId !== animeId || s.provider === watchStreamProvider) return;
    setEpisodesSourceProvider(null);
  }, [animeId, watchStreamProvider]);

  const runDeferredOppositeProviderPrefetch = useWatchAnimeDeferredPrefetch({
    animeId,
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
    if (!animeId.trim()) return;
    if (animeInfoLoading) return;
    if (episodeId != null) return;
    if (!initialEpisodeId || !episodes?.length) return;
    const valid = episodes.some((ep) => episodeMatchesSelection(ep, initialEpisodeId));
    if (valid) setEpisodeId(initialEpisodeId);
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
