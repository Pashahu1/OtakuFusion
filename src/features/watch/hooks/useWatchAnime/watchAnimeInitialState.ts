import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import { readWatchAnimeHydratedState } from '@/features/watch/lib/watch-catalog-session-hydrate';

export interface WatchAnimeInitialState {
  animeInfo: AnimeData | null;
  episodes: EpisodesTypes[] | null;
  hikkaCatalogProviderId: string | null;
  anikotoCatalogProviderId: string | null;
  totalEpisodes: number | null;
  episodeId: string | null;
  animeInfoLoading: boolean;
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  hikkaLanguageMenuEligible: boolean;
  anikotoLanguageMenuEligible: boolean;
  providerCatalogPending: boolean;
  episodesSourceProvider: WatchStreamProvider | null;
}

export function createInitialWatchAnimeState(
  animeId: string,
  watchStreamProvider: WatchStreamProvider,
  initialEpisodeId: string | undefined,
): WatchAnimeInitialState {
  const hydrated = readWatchAnimeHydratedState(animeId, watchStreamProvider, initialEpisodeId);
  if (!hydrated) {
    return {
      animeInfo: null,
      episodes: null,
      hikkaCatalogProviderId: null,
      anikotoCatalogProviderId: null,
      totalEpisodes: null,
      episodeId: null,
      animeInfoLoading: false,
      nextEpisodeSchedule: null,
      hikkaLanguageMenuEligible: false,
      anikotoLanguageMenuEligible: false,
      providerCatalogPending: false,
      episodesSourceProvider: null,
    };
  }

  return {
    animeInfo: hydrated.animeInfo,
    episodes: hydrated.episodes,
    hikkaCatalogProviderId: hydrated.hikkaCatalogProviderId,
    anikotoCatalogProviderId: null,
    totalEpisodes: hydrated.totalEpisodes,
    episodeId: hydrated.episodeId,
    animeInfoLoading: false,
    nextEpisodeSchedule: hydrated.nextEpisodeSchedule,
    hikkaLanguageMenuEligible: hydrated.hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible: false,
    providerCatalogPending: false,
    episodesSourceProvider: hydrated.episodesSourceProvider,
  };
}

export interface WatchAnimeLoadResetSetters {
  setEpisodes: (v: EpisodesTypes[] | null) => void;
  setEpisodeId: (v: string | null) => void;
  setAnimeInfo: (v: AnimeData | null) => void;
  setTotalEpisodes: (v: number | null) => void;
  setAnimeInfoLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  setHikkaLanguageMenuEligible: (v: boolean) => void;
  setHikkaCatalogProviderId: (v: string | null) => void;
  setProviderCatalogPending: (v: boolean) => void;
  setEpisodesSourceProvider: (v: WatchStreamProvider | null) => void;
  setNextEpisodeSchedule: (v: NextEpisodeScheduleResult | null) => void;
}

export function resetWatchAnimeLoadState(setters: WatchAnimeLoadResetSetters) {
  setters.setEpisodes(null);
  setters.setEpisodeId(null);
  setters.setAnimeInfo(null);
  setters.setTotalEpisodes(null);
  setters.setAnimeInfoLoading(true);
  setters.setError(null);
  setters.setHikkaLanguageMenuEligible(false);
  setters.setHikkaCatalogProviderId(null);
  setters.setProviderCatalogPending(false);
  setters.setEpisodesSourceProvider(null);
  setters.setNextEpisodeSchedule(null);
}
