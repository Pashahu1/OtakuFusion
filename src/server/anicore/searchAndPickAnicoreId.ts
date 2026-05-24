import {
  crysolineAnicoreInfo,
  crysolineAnicoreSearch,
  type CrysolineAnicoreSearchRow,
} from '@/server/crysoline/anicoreClient';
import {
  buildAnimepaheSearchQueryQueue,
  buildAnimepaheSearchTermsFromFields,
  type AnimepaheCatalogHints,
} from '@/services/catalog/catalogHints';
import { pickAnicoreSearchHit } from '@/services/anicore/pickAnicoreSearchHit';
import type { CatalogLookupBody } from '@/server/catalog/catalogLookupTypes';

async function tryInfoByAnilistId(anilistId: number): Promise<string | null> {
  try {
    const info = await crysolineAnicoreInfo(String(anilistId));
    const id = info?.id;
    if (typeof id === 'number' && id > 0) return String(id);
    if (typeof id === 'string' && id.trim()) return id.trim();
  } catch {

  }
  return null;
}

export async function searchAndPickAnicoreId(
  body: CatalogLookupBody,
  hints: AnimepaheCatalogHints,
  baseTerms: string[]
): Promise<string | null> {
  if (hints.anilistId != null) {
    const direct = await tryInfoByAnilistId(hints.anilistId);
    if (direct) return direct;
  }

  const queue = buildAnimepaheSearchQueryQueue(baseTerms)
    .map((q) => q.trim())
    .filter(Boolean);
  if (!queue.length) return null;

  const merged = new Map<number, CrysolineAnicoreSearchRow>();

  const firstHits = await crysolineAnicoreSearch(queue[0]).catch(
    () => [] as CrysolineAnicoreSearchRow[]
  );
  for (const h of firstHits) merged.set(h.id, h);

  const confident = pickAnicoreSearchHit([...merged.values()], hints);
  if (confident) return String(confident.id);

  if (queue.length > 1) {
    const rest = await Promise.all(
      queue.slice(1, 4).map((q) =>
        crysolineAnicoreSearch(q).catch(() => [] as CrysolineAnicoreSearchRow[])
      )
    );
    for (const hits of rest) {
      for (const h of hits) merged.set(h.id, h);
    }
  }

  const picked = pickAnicoreSearchHit([...merged.values()], hints);
  return picked ? String(picked.id) : null;
}

export function buildAnicoreSearchTermsFromBody(body: CatalogLookupBody): string[] {
  return buildAnimepaheSearchTermsFromFields({
    title: body.title,
    romaji_title: body.romaji_title,
    japanese_title: body.japanese_title,
    synonyms: body.synonyms,
  });
}
