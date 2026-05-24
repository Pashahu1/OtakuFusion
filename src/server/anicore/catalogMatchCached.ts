import { unstable_cache } from 'next/cache';
import type { CatalogHints } from '@/services/catalog/catalogHints';
import {
  searchAndPickAnicoreId,
  buildAnicoreSearchTermsFromBody,
} from '@/server/anicore/searchAndPickAnicoreId';
import {
  catalogMatchCacheKey,
  type CatalogLookupBody,
} from '@/server/catalog/catalogLookupTypes';

const MATCH_CACHE_REVALIDATE_SEC = 3600;

export function resolveAnicoreCatalogIdCached(
  body: CatalogLookupBody,
  hints: CatalogHints,
  baseTerms: string[]
): Promise<string | null> {
  const key = catalogMatchCacheKey(body);
  return unstable_cache(
    () => searchAndPickAnicoreId(body, hints, baseTerms),
    ['anicore-catalog-match-v1', key],
    { revalidate: MATCH_CACHE_REVALIDATE_SEC }
  )();
}

export { buildAnicoreSearchTermsFromBody };
