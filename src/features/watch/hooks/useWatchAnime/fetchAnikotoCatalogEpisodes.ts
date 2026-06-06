import { getAnikotoEpisodesBff } from '@/lib/bff/watch/anikoto-episodes';
import { postAnikotoCatalog } from '@/lib/bff/watch/anikoto-catalog';
import { mapAnikotoEpisodes } from '@/lib/catalog/providers/anikoto/mapAnikotoEpisodes';
import {
  readVerifiedAnikotoMapping,
  writeVerifiedAnikotoMapping,
} from '@/features/watch/lib/provider-mapping-cache';
import type { CatalogFetchBaseParams, ProviderCatalogFetchResult } from './catalogFetchTypes';

async function loadAnikotoEpisodes(
  slug: string,
  signal: AbortSignal,
): Promise<ProviderCatalogFetchResult['episodes']> {
  const payload = await getAnikotoEpisodesBff(slug, signal);
  if (!payload.success || !payload.data.length) return [];
  return mapAnikotoEpisodes(payload.data);
}

export async function fetchAnikotoCatalogEpisodes(
  params: CatalogFetchBaseParams,
): Promise<ProviderCatalogFetchResult> {
  const { animeId, catalogPayload, signal, forceFuzzy, isAborted } = params;

  let providerId: string | null = null;
  let list: ProviderCatalogFetchResult['episodes'] = [];

  if (!forceFuzzy) {
    const cached = readVerifiedAnikotoMapping(animeId);
    if (cached?.anikotoSlug) {
      try {
        const episodes = await loadAnikotoEpisodes(cached.anikotoSlug, signal);
        if (!isAborted() && episodes.length > 0) {
          providerId = cached.anikotoSlug;
          list = episodes;
        }
      } catch {
        providerId = null;
        list = [];
      }
    }
  }

  if (!providerId || !list.length) {
    const cached = readVerifiedAnikotoMapping(animeId);
    const catalog = await postAnikotoCatalog(
      {
        ...catalogPayload,
        ...(cached?.anikotoSlug ? { anikotoSlug: cached.anikotoSlug } : {}),
      },
      signal,
    );
    if (isAborted()) {
      throw new DOMException('Aborted', 'AbortError');
    }
    if (!catalog.success) {
      throw new Error(catalog.error);
    }
    if (!catalog.anikotoSlug?.trim()) {
      throw new Error('anikoto_catalog_bad_shape');
    }
    providerId = catalog.anikotoSlug.trim();
    writeVerifiedAnikotoMapping(animeId, providerId);
    list = await loadAnikotoEpisodes(providerId, signal);
    if (isAborted()) {
      throw new DOMException('Aborted', 'AbortError');
    }
  }

  return {
    providerId,
    episodes: list,
    freshLibertyCatalog: null,
    freshHikkaCatalog: null,
  };
}
