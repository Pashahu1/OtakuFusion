import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { catalogBodyFromAnimeData } from './watchAnimeCatalogUtils';
import type { CatalogFetchBaseParams, ProviderCatalogFetchResult } from './catalogFetchTypes';
import { fetchAnilibertyCatalogEpisodes } from './fetchAnilibertyCatalogEpisodes';
import { fetchAnikotoCatalogEpisodes } from './fetchAnikotoCatalogEpisodes';
import { fetchHikkaCatalogEpisodes } from './fetchHikkaCatalogEpisodes';
import {
  readVerifiedAnikotoMapping,
  readVerifiedLibertyMapping,
} from '@/features/watch/lib/provider-mapping-cache';

export function hydrateCachedProviderIds(params: {
  animeId: string;
  forceFuzzy: boolean;
  isAborted: () => boolean;
  setAnilibertyCatalogProviderId: (id: string) => void;
  setAnikotoCatalogProviderId: (id: string) => void;
}): void {
  const {
    animeId,
    forceFuzzy,
    isAborted,
    setAnilibertyCatalogProviderId,
    setAnikotoCatalogProviderId,
  } = params;
  if (forceFuzzy || isAborted()) return;
  const hidL = readVerifiedLibertyMapping(animeId);
  const hidA = readVerifiedAnikotoMapping(animeId);
  if (hidL?.libertyId) setAnilibertyCatalogProviderId(hidL.libertyId.trim());
  if (hidA?.anikotoSlug) setAnikotoCatalogProviderId(hidA.anikotoSlug.trim());
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

  if (params.watchStreamProvider === 'anikoto') {
    return fetchAnikotoCatalogEpisodes(base);
  }
  if (params.watchStreamProvider === 'hikka') {
    return fetchHikkaCatalogEpisodes(base);
  }
  return fetchAnilibertyCatalogEpisodes(base);
}
