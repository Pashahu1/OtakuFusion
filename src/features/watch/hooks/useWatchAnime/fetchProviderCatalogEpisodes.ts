import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { catalogBodyFromAnimeData } from './watchAnimeCatalogUtils';
import type { CatalogFetchBaseParams, ProviderCatalogFetchResult } from './catalogFetchTypes';
import { fetchAnikotoCatalogEpisodes } from './fetchAnikotoCatalogEpisodes';
import { fetchHikkaCatalogEpisodes } from './fetchHikkaCatalogEpisodes';
import { readVerifiedAnikotoMapping } from '@/features/watch/lib/provider-mapping-cache';

export function hydrateCachedProviderIds(params: {
  animeId: string;
  forceFuzzy: boolean;
  isAborted: () => boolean;
  setAnikotoCatalogProviderId: (id: string) => void;
}): void {
  const {
    animeId,
    forceFuzzy,
    isAborted,
    setAnikotoCatalogProviderId,
  } = params;
  if (forceFuzzy || isAborted()) return;
  const hidA = readVerifiedAnikotoMapping(animeId);
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
  return fetchHikkaCatalogEpisodes(base);
}
