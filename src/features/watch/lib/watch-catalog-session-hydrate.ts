import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import { resolveEpisodeIdAfterCatalog } from '@/features/watch/hooks/useWatchAnime/resolveEpisodeIdAfterCatalog';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import {
  readWatchCatalogSessionCache,
  type WatchCatalogSessionSnapshot,
} from './watch-catalog-session-cache';

export interface WatchAnimeHydratedState {
  animeInfo: AnimeData;
  episodes: EpisodesTypes[];
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  anilibertyCatalogProviderId: string | null;
  hikkaCatalogProviderId: string | null;
  totalEpisodes: number | null;
  episodeId: string | null;
  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
  episodesSourceProvider: WatchStreamProvider | null;
}

export function readWatchAnimeHydratedState(
  animeId: string,
  watchStreamProvider: WatchStreamProvider,
  initialEpisodeId: string | undefined
): WatchAnimeHydratedState | null {
  const cached = readWatchCatalogSessionCache(animeId, watchStreamProvider);
  if (!cached) return null;
  return mapSnapshotToHydratedState(cached, initialEpisodeId);
}

function mapSnapshotToHydratedState(
  cached: WatchCatalogSessionSnapshot,
  initialEpisodeId: string | undefined
): WatchAnimeHydratedState {
  return {
    animeInfo: cached.animeInfo,
    episodes: cached.episodes,
    nextEpisodeSchedule: cached.nextEpisodeSchedule,
    anilibertyCatalogProviderId: cached.anilibertyCatalogProviderId,
    hikkaCatalogProviderId: cached.hikkaCatalogProviderId,
    totalEpisodes: cached.totalEpisodes,
    episodeId: resolveEpisodeIdAfterCatalog(cached.episodes, null, initialEpisodeId),
    anilibertyLanguageMenuEligible: cached.anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible: cached.hikkaLanguageMenuEligible,
    episodesSourceProvider: cached.episodesSourceProvider,
  };
}

export function applyWatchAnimeHydratedState(
  hydrated: WatchAnimeHydratedState,
  setters: {
    setAnimeInfo: (v: AnimeData) => void;
    setEpisodes: (v: EpisodesTypes[]) => void;
    setNextEpisodeSchedule: (v: NextEpisodeScheduleResult | null) => void;
    setAnilibertyCatalogProviderId: (v: string | null) => void;
    setHikkaCatalogProviderId: (v: string | null) => void;
    setTotalEpisodes: (v: number | null) => void;
    setEpisodeId: (v: string | null) => void;
    setAnilibertyLanguageMenuEligible: (v: boolean) => void;
    setHikkaLanguageMenuEligible: (v: boolean) => void;
    setEpisodesSourceProvider: (v: WatchStreamProvider | null) => void;
    setAnimeInfoLoading: (v: boolean) => void;
    setProviderCatalogPending: (v: boolean) => void;
    setError: (v: string | null) => void;
  }
): void {
  setters.setAnimeInfo(hydrated.animeInfo);
  setters.setEpisodes(hydrated.episodes);
  setters.setNextEpisodeSchedule(hydrated.nextEpisodeSchedule);
  setters.setAnilibertyCatalogProviderId(hydrated.anilibertyCatalogProviderId);
  setters.setHikkaCatalogProviderId(hydrated.hikkaCatalogProviderId);
  setters.setTotalEpisodes(hydrated.totalEpisodes);
  setters.setEpisodeId(hydrated.episodeId);
  setters.setAnilibertyLanguageMenuEligible(hydrated.anilibertyLanguageMenuEligible);
  setters.setHikkaLanguageMenuEligible(hydrated.hikkaLanguageMenuEligible);
  setters.setEpisodesSourceProvider(hydrated.episodesSourceProvider);
  setters.setAnimeInfoLoading(false);
  setters.setProviderCatalogPending(false);
  setters.setError(null);
}
