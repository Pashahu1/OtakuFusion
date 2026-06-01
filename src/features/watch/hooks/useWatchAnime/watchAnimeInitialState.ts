import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import { readWatchAnimeHydratedState } from '@/features/watch/lib/watch-catalog-session-hydrate';

export interface WatchAnimeInitialState {
  animeInfo: AnimeData | null;
  episodes: EpisodesTypes[] | null;
  animepaheCatalogProviderId: string | null;
  anilibertyCatalogProviderId: string | null;
  hikkaCatalogProviderId: string | null;
  totalEpisodes: number | null;
  episodeId: string | null;
  animeInfoLoading: boolean;
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
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
      animepaheCatalogProviderId: null,
      anilibertyCatalogProviderId: null,
      hikkaCatalogProviderId: null,
      totalEpisodes: null,
      episodeId: null,
      animeInfoLoading: false,
      nextEpisodeSchedule: null,
      anilibertyLanguageMenuEligible: false,
      hikkaLanguageMenuEligible: false,
      providerCatalogPending: false,
      episodesSourceProvider: null,
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

export interface WatchAnimeLoadResetSetters {
  setEpisodes: (v: EpisodesTypes[] | null) => void;
  setAnimepaheCatalogProviderId: (v: string | null) => void;
  setAnilibertyCatalogProviderId: (v: string | null) => void;
  setEpisodeId: (v: string | null) => void;
  setAnimeInfo: (v: AnimeData | null) => void;
  setTotalEpisodes: (v: number | null) => void;
  setAnimeInfoLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  setAnilibertyLanguageMenuEligible: (v: boolean) => void;
  setHikkaLanguageMenuEligible: (v: boolean) => void;
  setHikkaCatalogProviderId: (v: string | null) => void;
  setProviderCatalogPending: (v: boolean) => void;
  setEpisodesSourceProvider: (v: WatchStreamProvider | null) => void;
  setNextEpisodeSchedule: (v: NextEpisodeScheduleResult | null) => void;
}

export function resetWatchAnimeLoadState(setters: WatchAnimeLoadResetSetters) {
  setters.setEpisodes(null);
  setters.setAnimepaheCatalogProviderId(null);
  setters.setAnilibertyCatalogProviderId(null);
  setters.setEpisodeId(null);
  setters.setAnimeInfo(null);
  setters.setTotalEpisodes(null);
  setters.setAnimeInfoLoading(true);
  setters.setError(null);
  setters.setAnilibertyLanguageMenuEligible(false);
  setters.setHikkaLanguageMenuEligible(false);
  setters.setHikkaCatalogProviderId(null);
  setters.setProviderCatalogPending(false);
  setters.setEpisodesSourceProvider(null);
  setters.setNextEpisodeSchedule(null);
}
