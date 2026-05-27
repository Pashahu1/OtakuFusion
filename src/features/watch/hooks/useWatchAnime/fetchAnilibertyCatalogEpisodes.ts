import { postAnilibertyCatalog } from '@/features/watch/lib/aniliberty-catalog-bff';
import { getAnilibertyEpisodesFromBff } from '@/lib/aniliberty-episodes-bff';
import type { CatalogFetchBaseParams, ProviderCatalogFetchResult } from './catalogFetchTypes';
import { isLibertyCatalogAcceptableForAnime } from './watchAnimeCatalogUtils';
import { writeLibertyEpisodesCache } from './anilibertyEpisodesCache';
import {
  clearVerifiedLibertyMapping,
  readVerifiedLibertyMapping,
} from './watchAnimeMappingCache';

export async function fetchAnilibertyCatalogEpisodes(
  params: CatalogFetchBaseParams
): Promise<ProviderCatalogFetchResult> {
  const { animeId, dataForResolve, catalogPayload, signal, forceFuzzy, isAborted } = params;

  let providerId: string | null = null;
  let list: ProviderCatalogFetchResult['episodes'] = [];
  let freshLibertyCatalog: ProviderCatalogFetchResult['freshLibertyCatalog'] = null;

  if (!forceFuzzy) {
    const cachedL = readVerifiedLibertyMapping(animeId);
    if (cachedL?.libertyId) {
      try {
        const cachedEp = await getAnilibertyEpisodesFromBff(cachedL.libertyId, signal);
        const cachedCount = cachedEp.totalEpisodes ?? cachedEp.episodes?.length ?? 0;
        if (
          !isAborted() &&
          (cachedEp.episodes?.length ?? 0) > 0 &&
          isLibertyCatalogAcceptableForAnime(dataForResolve, cachedCount)
        ) {
          providerId = cachedL.libertyId.trim();
          list = cachedEp.episodes ?? [];
          writeLibertyEpisodesCache(
            animeId,
            providerId,
            list,
            cachedCount
          );
        } else if (!isAborted()) {
          clearVerifiedLibertyMapping(animeId);
        }
      } catch {
        providerId = null;
        list = [];
      }
    }
  }

  if (!providerId || !list.length) {
    const catalog = await postAnilibertyCatalog(catalogPayload, signal);
    if (isAborted()) {
      throw new DOMException('Aborted', 'AbortError');
    }
    if (!catalog.success) {
      throw new Error(catalog.error);
    }
    if (!catalog.libertyId?.trim()) {
      throw new Error('aniliberty_catalog_bad_shape');
    }
    freshLibertyCatalog = catalog;
    providerId = catalog.libertyId.trim();
    list = catalog.episodes ?? [];
    if (list.length > 0) {
      writeLibertyEpisodesCache(
        animeId,
        providerId,
        list,
        catalog.totalEpisodes ?? list.length
      );
    }
  }

  return {
    providerId,
    episodes: list,
    freshPaheCatalog: null,
    freshLibertyCatalog,
    freshHikkaCatalog: null,
  };
}
