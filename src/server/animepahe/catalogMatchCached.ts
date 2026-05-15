import { unstable_cache } from 'next/cache';
import {
  crysolineAnimepaheSearch,
  type CrysolineAnimepaheSearchRow,
} from '@/server/crysoline/animepaheClient';
import { mergeParallelCatalogSearch } from '@/server/crysoline/parallelCatalogSearch';
import {
  buildAnimepaheSearchQueryQueue,
  buildAnimepaheSearchTermsFromFields,
  type AnimepaheCatalogHints,
} from '@/services/animepahe/catalogHints';
import { pickBestAnimepaheSearchHit } from '@/services/animepahe/pickAnimepaheSearchHit';
import {
  catalogMatchCacheKey,
  type CatalogLookupBody,
} from '@/server/catalog/catalogLookupTypes';

const MAX_SEARCH_QUERIES = 3;
const MERGED_HITS_SOFT_CAP = 10;
const MATCH_CACHE_REVALIDATE_SEC = 3600;

async function searchAndPickPaheId(
  body: CatalogLookupBody,
  hints: AnimepaheCatalogHints,
  baseTerms: string[]
): Promise<string | null> {
  const queue = buildAnimepaheSearchQueryQueue(baseTerms);
  if (!queue.length) return null;

  const pool = await mergeParallelCatalogSearch<CrysolineAnimepaheSearchRow>(
    queue,
    (q) => crysolineAnimepaheSearch(q),
    (h) => (h?.id?.trim() ? h.id.trim() : null),
    { maxQueries: MAX_SEARCH_QUERIES, mergedSoftCap: MERGED_HITS_SOFT_CAP }
  );

  const best = pickBestAnimepaheSearchHit(pool, hints, baseTerms);
  const id = best?.id?.trim();
  return id || null;
}

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
