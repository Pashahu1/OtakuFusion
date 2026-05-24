import { unstable_cache } from 'next/cache';
import type { AnimepaheCatalogHints } from '@/services/catalog/catalogHints';
import {
  searchAndPickAnimexId,
  buildAnimexSearchTermsFromBody,
} from '@/server/animex/searchAndPickAnimexId';
import {
  catalogMatchCacheKey,
  type CatalogLookupBody,
} from '@/server/catalog/catalogLookupTypes';

const MATCH_CACHE_REVALIDATE_SEC = 3600;

export function resolveAnimexCatalogIdCached(
  body: CatalogLookupBody,
  hints: AnimepaheCatalogHints,
  baseTerms: string[]
): Promise<string | null> {
  const key = catalogMatchCacheKey(body);
  return unstable_cache(
    () => searchAndPickAnimexId(body, hints, baseTerms),
    ['animex-catalog-match-v1', key],
    { revalidate: MATCH_CACHE_REVALIDATE_SEC }
  )();
}

export { buildAnimexSearchTermsFromBody };
