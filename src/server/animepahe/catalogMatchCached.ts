import { unstable_cache } from 'next/cache';
import { buildAnimepaheSearchTermsFromFields } from '@/lib/catalog/providers/animepahe/catalogHints';
import type { AnimepaheCatalogHints } from '@/lib/catalog/providers/animepahe/catalogHints';
import { searchAndPickPaheId } from '@/server/animepahe/searchAndPickPaheId';
import {
  catalogMatchCacheKey,
  type CatalogLookupBody,
} from '@/server/catalog/catalogLookupTypes';

const MATCH_CACHE_REVALIDATE_SEC = 3600;

export function resolveAnimepahePaheIdCached(
  body: CatalogLookupBody,
  hints: AnimepaheCatalogHints,
  baseTerms: string[]
): Promise<string | null> {
  const key = catalogMatchCacheKey(body);
  return unstable_cache(
    () => searchAndPickPaheId(body, hints, baseTerms),
    ['animepahe-catalog-match-v1', key],
    { revalidate: MATCH_CACHE_REVALIDATE_SEC }
  )();
}
