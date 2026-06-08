import type { MutableRefObject, RefObject } from 'react';

import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

import type { AnimeData } from '@/shared/types/animeDetailsTypes';

import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

import type { StableWatchLoadSnapshot, WarmAlternateCatalogEntry } from './types';



export interface WatchAnimeCatalogLoadParams {

  animeId: string;

  episodeRemapPass: number;

  watchStreamProvider: WatchStreamProvider;

  initialEpisodeRef: RefObject<string | undefined>;

  animeInfoRef: RefObject<AnimeData | null>;

  episodeIdRef: RefObject<string | null>;

  stableWatchLoadRef: MutableRefObject<StableWatchLoadSnapshot | null>;

  warmCatalogsRef: MutableRefObject<WarmAlternateCatalogEntry | null>;

  deferredOppositePrefetchRef: MutableRefObject<{

    animeId: string;

    data: AnimeData;

    provider: WatchStreamProvider;

  } | null>;

  oppositePrefetchDoneRef: MutableRefObject<string | null>;

  alternateWarmupAbortRef: MutableRefObject<AbortController | null>;

  setAnimeInfo: React.Dispatch<React.SetStateAction<AnimeData | null>>;

  setEpisodes: React.Dispatch<React.SetStateAction<EpisodesTypes[] | null>>;

  setAnilibertyCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;

  setHikkaCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;

  setTotalEpisodes: React.Dispatch<React.SetStateAction<number | null>>;

  setEpisodeId: React.Dispatch<React.SetStateAction<string | null>>;

  setAnimeInfoLoading: React.Dispatch<React.SetStateAction<boolean>>;

  setNextEpisodeSchedule: React.Dispatch<

    React.SetStateAction<NextEpisodeScheduleResult | null>

  >;

  setError: React.Dispatch<React.SetStateAction<string | null>>;

  setAnilibertyLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;

  setHikkaLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;

  setAnikotoCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;

  setAnikotoLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;

  setProviderCatalogPending: React.Dispatch<React.SetStateAction<boolean>>;

  setEpisodesSourceProvider: React.Dispatch<

    React.SetStateAction<WatchStreamProvider | null>

  >;

  setEpisodeRemapPass: React.Dispatch<React.SetStateAction<number>>;

}

