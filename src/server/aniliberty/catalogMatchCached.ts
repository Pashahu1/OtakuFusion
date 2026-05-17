import { unstable_cache } from 'next/cache';
import { crysolineAnilibertySearch } from '@/server/crysoline/anilibertyClient';
import { mergeParallelCatalogSearch } from '@/server/crysoline/parallelCatalogSearch';
import {
  buildAnimepaheSearchQueryQueue,
  buildAnimepaheSearchTermsFromFields,
  type AnimepaheCatalogHints,
} from '@/services/animepahe/catalogHints';
import { pickBestAnilibertySearchHit } from '@/services/aniliberty/pickAnilibertySearchHit';
import { isAnilibertyHitEligible } from '@/services/aniliberty/anilibertyEpisodeMatch';
import type { CrysolineAnilibertySearchRow } from '@/server/crysoline/anilibertyClient';
import {
  catalogMatchCacheKey,
  type CatalogLookupBody,
} from '@/server/catalog/catalogLookupTypes';

const MAX_SEARCH_QUERIES = 3;
const MERGED_HITS_SOFT_CAP = 10;
const MATCH_CACHE_REVALIDATE_SEC = 3600;

async function searchAndPickLibertyId(
  body: CatalogLookupBody,
  hints: AnimepaheCatalogHints,
  baseTerms: string[]
): Promise<string | null> {
  const queue = buildAnimepaheSearchQueryQueue(baseTerms);
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
  hints: AnimepaheCatalogHints,
  baseTerms: string[]
): Promise<string | null> {
  const key = catalogMatchCacheKey(body);
  return unstable_cache(
    () => searchAndPickLibertyId(body, hints, baseTerms),
    ['aniliberty-catalog-match-v4', key],
    { revalidate: MATCH_CACHE_REVALIDATE_SEC }
  )();
}
