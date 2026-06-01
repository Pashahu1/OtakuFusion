import { useRef, useState } from 'react';

import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

import type { StableWatchLoadSnapshot, WarmAlternateCatalogEntry } from './types';
import { createInitialWatchAnimeState } from './watchAnimeInitialState';

export function useWatchAnimeState(
  animeId: string,
  initialEpisodeId: string | undefined,
  watchStreamProvider: WatchStreamProvider,
) {
  const initialStateRef = useRef(
    createInitialWatchAnimeState(animeId, watchStreamProvider, initialEpisodeId),
  );
  const initial = initialStateRef.current;

  const [animeInfo, setAnimeInfo] = useState<AnimeData | null>(initial.animeInfo);
  const [episodes, setEpisodes] = useState<EpisodesTypes[] | null>(initial.episodes);
  const [animepaheCatalogProviderId, setAnimepaheCatalogProviderId] = useState<string | null>(
    initial.animepaheCatalogProviderId,
  );
  const [anilibertyCatalogProviderId, setAnilibertyCatalogProviderId] = useState<string | null>(
    initial.anilibertyCatalogProviderId,
  );
  const [totalEpisodes, setTotalEpisodes] = useState<number | null>(initial.totalEpisodes);
  const [episodeId, setEpisodeId] = useState<string | null>(initial.episodeId);
  const [animeInfoLoading, setAnimeInfoLoading] = useState(initial.animeInfoLoading);
  const [nextEpisodeSchedule, setNextEpisodeSchedule] = useState<NextEpisodeScheduleResult | null>(
    initial.nextEpisodeSchedule,
  );
  const [error, setError] = useState<string | null>(null);
  const [anilibertyLanguageMenuEligible, setAnilibertyLanguageMenuEligible] = useState(
    initial.anilibertyLanguageMenuEligible,
  );
  const [hikkaLanguageMenuEligible, setHikkaLanguageMenuEligible] = useState(
    initial.hikkaLanguageMenuEligible,
  );
  const [hikkaCatalogProviderId, setHikkaCatalogProviderId] = useState<string | null>(
    initial.hikkaCatalogProviderId,
  );
  const [providerCatalogPending, setProviderCatalogPending] = useState(
    initial.providerCatalogPending,
  );
  const [episodesSourceProvider, setEpisodesSourceProvider] = useState<WatchStreamProvider | null>(
    initial.episodesSourceProvider,
  );
  const [episodeRemapPass, setEpisodeRemapPass] = useState(0);

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
  const stableWatchLoad = useRef<StableWatchLoadSnapshot | null>(null);

  const animeInfoRef = useRef(animeInfo);
  animeInfoRef.current = animeInfo;
  const episodeIdRef = useRef(episodeId);
  episodeIdRef.current = episodeId;

  return {
    animeInfo,
    episodes,
    animepaheCatalogProviderId,
    anilibertyCatalogProviderId,
    hikkaCatalogProviderId,
    totalEpisodes,
    episodeId,
    animeInfoLoading,
    nextEpisodeSchedule,
    error,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    providerCatalogPending,
    episodesSourceProvider,
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
    setError,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
    setProviderCatalogPending,
    setEpisodesSourceProvider,
    setEpisodeRemapPass,
    initialEpisodeRef,
    deferredOppositePrefetchRef,
    oppositePrefetchDoneRef,
    oppositePrefetchAbortRef,
    alternateWarmupAbortRef,
    warmCatalogsRef,
    stableWatchLoad,
    animeInfoRef,
    episodeIdRef,
  };
}

export type WatchAnimeState = ReturnType<typeof useWatchAnimeState>;
