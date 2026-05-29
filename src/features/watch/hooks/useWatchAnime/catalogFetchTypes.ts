import type { AnimepaheCatalogBffOk } from '@/lib/bff/watch/animepahe-catalog';
import type { AnilibertyCatalogBffOk } from '@/lib/bff/watch/aniliberty-catalog';
import type { HikkaCatalogBffOk } from '@/lib/bff/watch/hikka-catalog';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { catalogBodyFromAnimeData } from './watchAnimeCatalogUtils';

export type CatalogPayload = ReturnType<typeof catalogBodyFromAnimeData>;

export interface ProviderCatalogFetchResult {
  providerId: string;
  episodes: EpisodesTypes[];
  freshPaheCatalog: AnimepaheCatalogBffOk | null;
  freshLibertyCatalog: AnilibertyCatalogBffOk | null;
  freshHikkaCatalog: HikkaCatalogBffOk | null;
}

export interface CatalogFetchBaseParams {
  animeId: string;
  dataForResolve: AnimeData;
  catalogPayload: CatalogPayload;
  signal: AbortSignal;
  forceFuzzy: boolean;
  isAborted: () => boolean;
}
