import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { catalogBodyFromAnimeData } from './watchAnimeCatalogUtils';
import type { CatalogFetchBaseParams, ProviderCatalogFetchResult } from './catalogFetchTypes';
import { fetchHikkaCatalogEpisodes } from './fetchHikkaCatalogEpisodes';

export function hydrateCachedProviderIds(_params: {
  animeId: string;
  forceFuzzy: boolean;
  isAborted: () => boolean;
}): void {
  /* Hikka mapping is applied in the Hikka catalog fetch. */
}

export async function fetchProviderCatalogEpisodes(params: {
  watchStreamProvider: WatchStreamProvider;
  animeId: string;
  dataForResolve: AnimeData;
  signal: AbortSignal;
  forceFuzzy: boolean;
  isAborted: () => boolean;
}): Promise<ProviderCatalogFetchResult> {
  void params.watchStreamProvider;
  const base: CatalogFetchBaseParams = {
    animeId: params.animeId,
    dataForResolve: params.dataForResolve,
    catalogPayload: catalogBodyFromAnimeData(params.dataForResolve, params.animeId),
    signal: params.signal,
    forceFuzzy: params.forceFuzzy,
    isAborted: params.isAborted,
  };

  return fetchHikkaCatalogEpisodes(base);
}
