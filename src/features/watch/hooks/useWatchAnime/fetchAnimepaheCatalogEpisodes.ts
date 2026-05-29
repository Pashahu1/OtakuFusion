import { postAnimepaheCatalog } from '@/lib/animepahe-catalog-bff';
import { getAnimePaheEpisodesFromBff } from '@/lib/animepahe-episodes-bff';
import { patchEpisodesSeriesDub } from '@/lib/catalog/providers/animepahe/patchEpisodesSeriesDub';
import type { CatalogFetchBaseParams, ProviderCatalogFetchResult } from './catalogFetchTypes';
import {
  clearVerifiedPaheMapping,
  readVerifiedPaheMapping,
} from '@/features/watch/lib/provider-mapping-cache';

export async function fetchAnimepaheCatalogEpisodes(
  params: CatalogFetchBaseParams
): Promise<ProviderCatalogFetchResult> {
  const { animeId, catalogPayload, signal, forceFuzzy, isAborted } = params;

  let providerId: string | null = null;
  let list: ProviderCatalogFetchResult['episodes'] = [];
  let freshPaheCatalog: ProviderCatalogFetchResult['freshPaheCatalog'] = null;

  if (!forceFuzzy) {
    const cached = readVerifiedPaheMapping(animeId);
    if (cached?.paheId) {
      try {
        const cachedEp = await getAnimePaheEpisodesFromBff(cached.paheId, signal);
        if (!isAborted() && (cachedEp.episodes?.length ?? 0) > 0) {
          providerId = cached.paheId.trim();
          list = patchEpisodesSeriesDub(
            cachedEp.episodes ?? [],
            cached.hasSeriesDub === true
          );
        }
      } catch {
        clearVerifiedPaheMapping(animeId);
        providerId = null;
        list = [];
      }
    }
  }

  if (!providerId || !list.length) {
    const catalog = await postAnimepaheCatalog(catalogPayload, signal);
    if (isAborted()) {
      throw new DOMException('Aborted', 'AbortError');
    }
    if (!catalog.success) {
      throw new Error(catalog.error);
    }
    if (!catalog.paheId?.trim()) {
      throw new Error('animepahe_catalog_bad_shape');
    }
    freshPaheCatalog = catalog;
    providerId = catalog.paheId.trim();
    list = catalog.episodes ?? [];
  }

  return {
    providerId,
    episodes: list,
    freshPaheCatalog,
    freshLibertyCatalog: null,
    freshHikkaCatalog: null,
  };
}
