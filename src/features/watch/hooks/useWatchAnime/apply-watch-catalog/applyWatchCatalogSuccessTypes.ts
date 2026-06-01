import type { AnimepaheCatalogBffOk } from '@/lib/bff/watch/animepahe-catalog';
import type { AnilibertyCatalogBffOk } from '@/lib/bff/watch/aniliberty-catalog';
import type { HikkaCatalogBffOk } from '@/lib/bff/watch/hikka-catalog';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type {
  AlternateLanguageMenuSetters,
  StableWatchLoadSnapshot,
  WarmAlternateCatalogEntry,
} from '../types';

export interface ApplyWatchCatalogSuccessContext {
  animeId: string;
  episodeRemapPass: number;
  watchStreamProvider: WatchStreamProvider;
  getIsCancelled: () => boolean;
  initialEpisodeRef: React.RefObject<string | undefined>;
  stableWatchLoadRef: React.MutableRefObject<StableWatchLoadSnapshot | null>;
  warmCatalogsRef: React.MutableRefObject<WarmAlternateCatalogEntry | null>;
  deferredOppositePrefetchRef: React.MutableRefObject<{
    animeId: string;
    data: AnimeData;
    provider: WatchStreamProvider;
  } | null>;
  menuSetters: AlternateLanguageMenuSetters;
  setAnimeInfo: React.Dispatch<React.SetStateAction<AnimeData | null>>;
  setEpisodes: React.Dispatch<React.SetStateAction<EpisodesTypes[] | null>>;
  setAnimepaheCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setAnilibertyCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setHikkaCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setTotalEpisodes: React.Dispatch<React.SetStateAction<number | null>>;
  setEpisodeId: React.Dispatch<React.SetStateAction<string | null>>;
  setAnimeInfoLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setAnilibertyLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;
  setHikkaLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;
  setProviderCatalogPending: React.Dispatch<React.SetStateAction<boolean>>;
  setEpisodesSourceProvider: React.Dispatch<React.SetStateAction<WatchStreamProvider | null>>;
}

export interface ApplyWatchCatalogSuccessOpts {
  forceFuzzy: boolean;
  freshPaheCatalog: AnimepaheCatalogBffOk | null;
  freshLibertyCatalog: AnilibertyCatalogBffOk | null;
  freshHikkaCatalog: HikkaCatalogBffOk | null;
  preserveEpisodeNum: string | null;
  settleLoading: { current: boolean };
}
