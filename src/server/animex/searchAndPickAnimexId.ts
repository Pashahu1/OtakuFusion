import {
  crysolineAnimexInfo,
  crysolineAnimexSearch,
  type CrysolineAnimexSearchRow,
} from '@/server/crysoline/animexClient';
import { crysolineAnicoreInfo } from '@/server/crysoline/anicoreClient';
import {
  buildAnimepaheSearchQueryQueue,
  buildAnimepaheSearchTermsFromFields,
  type AnimepaheCatalogHints,
} from '@/services/catalog/catalogHints';
import { pickAnimexSearchHit } from '@/services/animex/pickAnimexSearchHit';
import type { CatalogLookupBody } from '@/server/catalog/catalogLookupTypes';

function pickIdFromInfo(info: Record<string, unknown>): string | null {
  const id = info?.id;
  if (typeof id === 'number' && id > 0) return String(id);
  if (typeof id === 'string' && id.trim()) return id.trim();
  return null;
}

async function tryInfoByAnilistId(anilistId: number): Promise<string | null> {
  const key = String(anilistId);
  try {
    const fromAnimex = pickIdFromInfo(await crysolineAnimexInfo(key));
    if (fromAnimex) return fromAnimex;
  } catch {

  }
  try {
    return pickIdFromInfo(await crysolineAnicoreInfo(key));
  } catch {
    return null;
  }
}

export async function searchAndPickAnimexId(
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

  const merged = new Map<number, CrysolineAnimexSearchRow>();

  const firstHits = await crysolineAnimexSearch(queue[0]).catch(
    () => [] as CrysolineAnimexSearchRow[]
  );
  for (const h of firstHits) merged.set(h.id, h);

  const confident = pickAnimexSearchHit([...merged.values()], hints);
  if (confident) return String(confident.id);

  if (queue.length > 1) {
    const rest = await Promise.all(
      queue.slice(1, 4).map((q) =>
        crysolineAnimexSearch(q).catch(() => [] as CrysolineAnimexSearchRow[])
      )
    );
    for (const hits of rest) {
      for (const h of hits) merged.set(h.id, h);
    }
  }

  const picked = pickAnimexSearchHit([...merged.values()], hints);
  return picked ? String(picked.id) : null;
}

export function buildAnimexSearchTermsFromBody(body: CatalogLookupBody): string[] {
  return buildAnimepaheSearchTermsFromFields({
    title: body.title,
    romaji_title: body.romaji_title,
    japanese_title: body.japanese_title,
    synonyms: body.synonyms,
  });
}
