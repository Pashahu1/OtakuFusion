import {
  crysolineAnimepaheSearch,
  type CrysolineAnimepaheSearchRow,
} from '@/server/crysoline/animepaheClient';
import {
  buildAnimepaheSearchQueryQueue,
  normalizeCatalogSearchQuery,
  type AnimepaheCatalogHints,
} from '@/services/animepahe/catalogHints';
import {
  pickBestAnimepaheSearchHit,
  pickBestAnimepaheSearchHitRelaxed,
} from '@/services/animepahe/pickAnimepaheSearchHit';
import type { CatalogLookupBody } from '@/server/catalog/catalogLookupTypes';

const MAX_SEARCH_QUERIES = 3;
const MERGED_HITS_SOFT_CAP = 10;

function mergeSearchHits(
  merged: Map<string, CrysolineAnimepaheSearchRow>,
  hits: CrysolineAnimepaheSearchRow[]
): void {
  for (const h of hits) {
    const id = h?.id?.trim();
    if (!id || merged.has(id)) continue;
    merged.set(id, h);
    if (merged.size >= MERGED_HITS_SOFT_CAP) break;
  }
}

function pickIdFromPool(
  pool: CrysolineAnimepaheSearchRow[],
  hints: AnimepaheCatalogHints,
  baseTerms: string[]
): string | null {
  const confident = pickBestAnimepaheSearchHit(pool, hints, baseTerms);
  const id = confident?.id?.trim();
  if (id) return id;
  const relaxed = pickBestAnimepaheSearchHitRelaxed(pool, hints, baseTerms);
  return relaxed?.id?.trim() || null;
}

/**
 * 1) ╨₧╨┤╨╕╨╜ ╨╜╨░╨╣╨║╤Ç╨░╤ë╨╕╨╣ search-╨╖╨░╨┐╨╕╤é ΓÇö ╤Å╨║╤ë╨╛ ╨▓╨┐╨╡╨▓╨╜╨╡╨╜╨╕╨╣ ╨╝╨░╤é╤ç, ╨╛╨┤╤Ç╨░╨╖╤â ╨┐╨╛╨▓╨╡╤Ç╤é╨░╤ö╨╝╨╛ (╨╜╨╡ ╤ç╨╡╨║╨░╤ö╨╝╨╛ 2ΓÇô3).
 * 2) ╨å╨╜╨░╨║╤ê╨╡ ΓÇö ╤Ç╨╡╤ê╤é╨░ ╨╖╨░╨┐╨╕╤é╤û╨▓ ╨┐╨░╤Ç╨░╨╗╨╡╨╗╤î╨╜╨╛ (╨╜╨╡ ╨┐╨╛╤ü╨╗╤û╨┤╨╛╨▓╨╜╨╛ 3├ù latency).
 */
export async function searchAndPickPaheId(
  body: CatalogLookupBody,
  hints: AnimepaheCatalogHints,
  baseTerms: string[]
): Promise<string | null> {
  const queue = buildAnimepaheSearchQueryQueue(baseTerms)
    .slice(0, MAX_SEARCH_QUERIES)
    .map((q) => normalizeCatalogSearchQuery(q))
    .filter((q) => q.length >= 2);

  if (!queue.length) return null;

  const merged = new Map<string, CrysolineAnimepaheSearchRow>();

  const firstHits = await crysolineAnimepaheSearch(queue[0]).catch(() => [] as CrysolineAnimepaheSearchRow[]);
  mergeSearchHits(merged, firstHits);
  const confidentFirst = pickBestAnimepaheSearchHit([...merged.values()], hints, baseTerms);
  const confidentId = confidentFirst?.id?.trim();
  if (confidentId) return confidentId;

  if (queue.length > 1) {
    const restBatches = await Promise.all(
      queue.slice(1).map((q) =>
        crysolineAnimepaheSearch(q).catch(() => [] as CrysolineAnimepaheSearchRow[])
      )
    );
    for (const hits of restBatches) {
      mergeSearchHits(merged, hits);
      if (merged.size >= MERGED_HITS_SOFT_CAP) break;
    }
  }

  return pickIdFromPool([...merged.values()], hints, baseTerms);
}
