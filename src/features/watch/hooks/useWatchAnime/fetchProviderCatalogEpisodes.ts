import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { catalogBodyFromAnimeData } from './watchAnimeCatalogUtils';
import type { CatalogFetchBaseParams, ProviderCatalogFetchResult } from './catalogFetchTypes';
import { fetchAnimepaheCatalogEpisodes } from './fetchAnimepaheCatalogEpisodes';
import { fetchAnilibertyCatalogEpisodes } from './fetchAnilibertyCatalogEpisodes';
import { fetchHikkaCatalogEpisodes } from './fetchHikkaCatalogEpisodes';
import {
  readVerifiedLibertyMapping,
  readVerifiedPaheMapping,
} from './watchAnimeMappingCache';

export function hydrateCachedProviderIds(params: {
  animeId: string;
  forceFuzzy: boolean;
  isAborted: () => boolean;
  setAnimepaheCatalogProviderId: (id: string) => void;
  setAnilibertyCatalogProviderId: (id: string) => void;
}): void {
  const {
    animeId,
    forceFuzzy,
    isAborted,
    setAnimepaheCatalogProviderId,
    setAnilibertyCatalogProviderId,
  } = params;
  if (forceFuzzy || isAborted()) return;
  const hidP = readVerifiedPaheMapping(animeId);
  const hidL = readVerifiedLibertyMapping(animeId);
  if (hidP?.paheId) setAnimepaheCatalogProviderId(hidP.paheId.trim());
  if (hidL?.libertyId) setAnilibertyCatalogProviderId(hidL.libertyId.trim());
}

export async function fetchProviderCatalogEpisodes(params: {
  watchStreamProvider: WatchStreamProvider;
  animeId: string;
  dataForResolve: AnimeData;
  signal: AbortSignal;
  forceFuzzy: boolean;
  isAborted: () => boolean;
}): Promise<ProviderCatalogFetchResult> {
  const base: CatalogFetchBaseParams = {
    animeId: params.animeId,
    dataForResolve: params.dataForResolve,
    catalogPayload: catalogBodyFromAnimeData(params.dataForResolve, params.animeId),
    signal: params.signal,
    forceFuzzy: params.forceFuzzy,
    isAborted: params.isAborted,
  };

  if (params.watchStreamProvider === 'hikka') {
    return fetchHikkaCatalogEpisodes(base);
  }
  if (params.watchStreamProvider === 'aniliberty') {
    return fetchAnilibertyCatalogEpisodes(base);
  }
  return fetchAnimepaheCatalogEpisodes(base);
}
