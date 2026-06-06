import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

export interface UseWatchAnimeReturn {
  animeInfo: AnimeData | null;
  anilibertyCatalogProviderId: string | null;
  providerAnimeId: string | null;
  episodes: EpisodesTypes[] | null;
  totalEpisodes: number | null;
  episodeId: string | null;
  setEpisodeId: React.Dispatch<React.SetStateAction<string | null>>;
  animeInfoLoading: boolean;
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  error: string | null;
  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
  anikotoLanguageMenuEligible: boolean;
  hikkaCatalogProviderId: string | null;
  anikotoCatalogProviderId: string | null;
  providerCatalogPending: boolean;

  episodesSourceProvider: WatchStreamProvider | null;
  runDeferredOppositeProviderPrefetch: () => void;
}

export interface WarmAlternateCatalogEntry {
  animeId: string;
  hikka?: { slug: string; episodes: EpisodesTypes[] };
  liberty?: { libertyId: string; episodes: EpisodesTypes[] };
}

export interface AlternateLanguageMenuSetters {
  setHikkaCatalogProviderId: (id: string) => void;
  setHikkaLanguageMenuEligible: (v: boolean) => void;
  setAnilibertyCatalogProviderId: (id: string) => void;
  setAnilibertyLanguageMenuEligible: (v: boolean) => void;
  setAnikotoCatalogProviderId: (id: string) => void;
  setAnikotoLanguageMenuEligible: (v: boolean) => void;
}

export interface StableWatchLoadSnapshot {
  animeId: string;
  remap: number;
  provider: WatchStreamProvider;
}
