import type { AnimepaheCatalogBffOk } from '@/lib/animepahe-catalog-bff';
import type { AnilibertyCatalogBffOk } from '@/features/watch/lib/aniliberty-catalog-bff';
import type { HikkaCatalogBffOk } from '@/features/watch/lib/hikka-catalog-bff';
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
