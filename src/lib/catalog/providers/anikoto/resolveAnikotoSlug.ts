import {
  buildCatalogSearchTermsFromFields,
  type CatalogHints,
} from '@/lib/catalog/catalog-hints';
import { pickBestAnikotoSearchHit } from '@/lib/catalog/providers/anikoto/pickAnikotoSearchHit';
import { anikotoInfo, anikotoSearch } from '@/server/anikoto/client';
import type { AnikotoInfoData, AnikotoSearchRow } from '@/server/anikoto/types';

const MAX_CANDIDATES = 8;

function idsMatch(info: AnikotoInfoData, hints: CatalogHints): boolean {
  if (hints.anilistId != null && info.anilistId === hints.anilistId) return true;
  if (hints.malId != null && info.malId === hints.malId) return true;
  return false;
}

async function findSlugByInfoIds(
  candidates: AnikotoSearchRow[],
  hints: CatalogHints,
): Promise<string | null> {
  const slugs = candidates
    .map((row) => row.id?.trim())
    .filter((slug): slug is string => Boolean(slug))
    .slice(0, MAX_CANDIDATES);

  const checks = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const payload = await anikotoInfo(slug);
        if (!payload.success || !payload.data) return null;
        return idsMatch(payload.data, hints) ? slug : null;
      } catch {
        return null;
      }
    }),
  );

  return checks.find((slug): slug is string => Boolean(slug)) ?? null;
}

async function resolveByTitleSearchOnce(
  terms: string[],
  hints: CatalogHints,
): Promise<string | null> {
  const query = terms[0]?.trim();
  if (!query) return null;

  const search = await anikotoSearch(query);
  if (!search.success || !Array.isArray(search.data) || !search.data.length) return null;

  const byIds = await findSlugByInfoIds(search.data, hints);
  if (byIds) return byIds;

  const best = pickBestAnikotoSearchHit(search.data, hints, terms);
  return best?.id?.trim() || null;
}

export async function resolveAnikotoSlug(params: {
  title: string;
  romaji_title?: string;
  japanese_title?: string;
  synonyms?: string;
  hints: CatalogHints;
  knownSlug?: string | null;
}): Promise<string | null> {
  const known = params.knownSlug?.trim();
  if (known) {
    try {
      const payload = await anikotoInfo(known);
      if (payload.success && payload.data && idsMatch(payload.data, params.hints)) {
        return known;
      }
    } catch {
      // fall through to search
    }
  }

  const terms = buildCatalogSearchTermsFromFields({
    title: params.title,
    romaji_title: params.romaji_title,
    japanese_title: params.japanese_title,
    synonyms: params.synonyms,
  });

  return resolveByTitleSearchOnce(terms, params.hints);
}
