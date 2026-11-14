import { episodeMatchesSelection } from '@/shared/utils/episodeUtils';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

interface PlayerShellPendingInput {
  animeInfoLoading: boolean;
  episodes: EpisodesTypes[] | null;
  episodeId: string | null;
}

export function computePlayerShellPending({
  animeInfoLoading,
  episodes,
  episodeId,
}: PlayerShellPendingInput): boolean {
  if (animeInfoLoading) return true;
  if (episodes === null) return true;
  if (episodeId == null && episodes.length > 0) return true;
  if (
    Boolean(episodeId) &&
    episodes.length > 0 &&
    episodes.every((e) => !episodeMatchesSelection(e, episodeId))
  ) {
    return true;
  }
  return false;
}

interface WatchAnimeCatalogSlice {
  animeInfo: {
    id: string;
    mal_id: number | null;
    title: string;
    animeInfo?: {
      Status?: string;
      tvInfo?: { episodeTotal?: string; has_dub?: number };
    };
  } | null;
  episodeId: string | null;
  episodes: EpisodesTypes[] | null;
  providerCatalogPending: boolean;
  episodesSourceProvider: WatchStreamProvider | null;
  hikkaCatalogProviderId: string | null;
}

export function selectEpisodeEpToken(
  anime: Pick<
    WatchAnimeCatalogSlice,
    'episodeId' | 'episodes' | 'providerCatalogPending' | 'episodesSourceProvider'
  >,
  watchStreamProvider: WatchStreamProvider,
): string | null {
  if (!anime.episodeId || !anime.episodes?.length) return null;
  if (anime.providerCatalogPending) return null;
  if (
    anime.episodesSourceProvider != null &&
    anime.episodesSourceProvider !== watchStreamProvider
  ) {
    return null;
  }
  const ep = anime.episodes.find((e) => episodeMatchesSelection(e, anime.episodeId));
  return ep?.ep_token?.trim() || null;
}

export function selectProviderAnimeId(
  anime: Pick<
    WatchAnimeCatalogSlice,
    'hikkaCatalogProviderId'
  >,
  watchStreamProvider: WatchStreamProvider,
): string | null {
  void watchStreamProvider;
  return anime.hikkaCatalogProviderId;
}

export function selectActiveEpisodeNum(
  episodes: EpisodesTypes[] | null | undefined,
  episodeId: string | null,
): number | null {
  if (!episodes?.length || !episodeId) return null;
  const ep = episodes.find((e) => episodeMatchesSelection(e, episodeId));
  return ep?.episode_no ?? null;
}

export type { WatchAnimeCatalogSlice };
