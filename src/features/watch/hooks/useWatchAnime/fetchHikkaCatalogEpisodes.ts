import { postHikkaCatalog } from '@/features/watch/lib/hikka-catalog-bff';
import type { CatalogFetchBaseParams, ProviderCatalogFetchResult } from './catalogFetchTypes';
import { readVerifiedHikkaMapping } from './watchAnimeMappingCache';

export async function fetchHikkaCatalogEpisodes(
  params: CatalogFetchBaseParams
): Promise<ProviderCatalogFetchResult> {
  const { animeId, catalogPayload, signal, forceFuzzy, isAborted } = params;

  let providerId: string | null = null;
  let list: ProviderCatalogFetchResult['episodes'] = [];
  let freshHikkaCatalog: ProviderCatalogFetchResult['freshHikkaCatalog'] = null;

  if (!forceFuzzy) {
    const cachedH = readVerifiedHikkaMapping(animeId);
    if (cachedH?.hikkaSlug) {
      try {
        const catalog = await postHikkaCatalog(catalogPayload, signal);
        if (
          !isAborted() &&
          catalog.success &&
          catalog.hikkaSlug.trim() === cachedH.hikkaSlug &&
          (catalog.episodes?.length ?? 0) > 0
        ) {
          providerId = cachedH.hikkaSlug;
          list = catalog.episodes ?? [];
        }
      } catch {
        providerId = null;
        list = [];
      }
    }
  }

  if (!providerId || !list.length) {
    const catalog = await postHikkaCatalog(catalogPayload, signal);
    if (isAborted()) {
      throw new DOMException('Aborted', 'AbortError');
    }
    if (!catalog.success) {
      throw new Error(catalog.error);
    }
    if (!catalog.hikkaSlug?.trim()) {
      throw new Error('hikka_catalog_bad_shape');
    }
    freshHikkaCatalog = catalog;
    providerId = catalog.hikkaSlug.trim();
    list = catalog.episodes ?? [];
  }

  return {
    providerId,
    episodes: list,
    freshPaheCatalog: null,
    freshLibertyCatalog: null,
    freshHikkaCatalog,
  };
}
