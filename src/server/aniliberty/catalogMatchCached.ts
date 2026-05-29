import { unstable_cache } from 'next/cache';
import { crysolineAnilibertySearch } from '@/server/crysoline/anilibertyClient';
import { mergeParallelCatalogSearch } from '@/server/crysoline/parallelCatalogSearch';
import {
  buildCatalogSearchQueryQueue,
  buildCatalogSearchTermsFromFields,
  type CatalogHints,
} from '@/lib/catalog/catalog-hints';
import { pickBestAnilibertySearchHit } from '@/lib/catalog/providers/aniliberty/pickAnilibertySearchHit';
import { isAnilibertyHitEligible } from '@/lib/catalog/providers/aniliberty/anilibertyEpisodeMatch';
import type { CrysolineAnilibertySearchRow } from '@/server/crysoline/anilibertyClient';
import {
  catalogMatchCacheKey,
  type CatalogLookupBody,
} from '@/server/catalog/catalogLookupTypes';

const MAX_SEARCH_QUERIES = 5;
const MERGED_HITS_SOFT_CAP = 12;
const MATCH_CACHE_REVALIDATE_SEC = 3600;

async function searchAndPickLibertyId(
  body: CatalogLookupBody,
  hints: CatalogHints,
  baseTerms: string[]
): Promise<string | null> {
  const queue = buildCatalogSearchQueryQueue(baseTerms);
  if (!queue.length) return null;

  const pool = await mergeParallelCatalogSearch<CrysolineAnilibertySearchRow>(
    queue,
    (q) => crysolineAnilibertySearch(q),
    (h) => (typeof h?.id === 'number' && Number.isFinite(h.id) ? h.id : null),
    { maxQueries: MAX_SEARCH_QUERIES, mergedSoftCap: MERGED_HITS_SOFT_CAP }
  );

  const best = pickBestAnilibertySearchHit(pool, hints, baseTerms);
  if (best == null || !Number.isFinite(best.id)) return null;
  if (!isAnilibertyHitEligible(best, hints)) return null;
  return String(Math.floor(best.id));
}

/** Кешований пошук AniList → Anilibria release id (без завантаження епізодів). */
export function resolveAnilibertyLibertyIdCached(
  body: CatalogLookupBody,
  hints: CatalogHints,
  baseTerms: string[]
): Promise<string | null> {
  const key = catalogMatchCacheKey(body);
  return unstable_cache(
    () => searchAndPickLibertyId(body, hints, baseTerms),
    ['aniliberty-catalog-match-v5', key],
    { revalidate: MATCH_CACHE_REVALIDATE_SEC }
  )();
}
