import { postAnicoreCatalog } from '@/features/watch/lib/anicore-catalog-bff';
import { getAnicoreEpisodesFromBff } from '@/lib/anicore-episodes-bff';
import { patchEpisodesSeriesDub } from '@/services/anicore/patchEpisodesSeriesDub';
import type { CatalogFetchBaseParams, ProviderCatalogFetchResult } from './catalogFetchTypes';
import {
  clearVerifiedAnicoreMapping,
  readVerifiedAnicoreMapping,
} from './watchAnimeMappingCache';

export async function fetchAnicoreCatalogEpisodes(
  params: CatalogFetchBaseParams
): Promise<ProviderCatalogFetchResult> {
  const { animeId, catalogPayload, signal, forceFuzzy, isAborted } = params;

  let providerId: string | null = null;
  let list: ProviderCatalogFetchResult['episodes'] = [];
  let freshAnicoreCatalog: ProviderCatalogFetchResult['freshAnicoreCatalog'] = null;

  if (!forceFuzzy) {
    const cached = readVerifiedAnicoreMapping(animeId);
    if (cached?.anicoreId) {
      try {
        const cachedEp = await getAnicoreEpisodesFromBff(cached.anicoreId, signal);
        if (!isAborted() && (cachedEp.episodes?.length ?? 0) > 0) {
          providerId = cached.anicoreId.trim();
          list = patchEpisodesSeriesDub(
            cachedEp.episodes ?? [],
            cached.hasSeriesDub === true
          );
        }
      } catch {
        clearVerifiedAnicoreMapping(animeId);
        providerId = null;
        list = [];
      }
    }
  }

  if (!providerId || !list.length) {
    const catalog = await postAnicoreCatalog(catalogPayload, signal);
    if (isAborted()) {
      throw new DOMException('Aborted', 'AbortError');
    }
    if (!catalog.success) {
      throw new Error(catalog.error);
    }
    if (!catalog.anicoreId?.trim()) {
      throw new Error('anicore_catalog_bad_shape');
    }
    freshAnicoreCatalog = catalog;
    providerId = catalog.anicoreId.trim();
    list = catalog.episodes ?? [];
  }

  return {
    providerId,
    episodes: list,
    freshAnicoreCatalog,
    freshLibertyCatalog: null,
    freshHikkaCatalog: null,
  };
}
