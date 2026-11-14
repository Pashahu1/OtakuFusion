import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

export interface UseWatchAnimeReturn {
  animeInfo: AnimeData | null;
  providerAnimeId: string | null;
  episodes: EpisodesTypes[] | null;
  totalEpisodes: number | null;
  episodeId: string | null;
  setEpisodeId: React.Dispatch<React.SetStateAction<string | null>>;
  animeInfoLoading: boolean;
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  error: string | null;
  hikkaLanguageMenuEligible: boolean;
  hikkaCatalogProviderId: string | null;
  providerCatalogPending: boolean;

  episodesSourceProvider: WatchStreamProvider | null;
  runDeferredOppositeProviderPrefetch: () => void;
}

export interface WarmAlternateCatalogEntry {
  animeId: string;
  hikka?: { slug: string; episodes: EpisodesTypes[] };
}

export interface StableWatchLoadSnapshot {
  animeId: string;
  remap: number;
  provider: WatchStreamProvider;
}
