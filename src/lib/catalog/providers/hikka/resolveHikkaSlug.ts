import {
  buildCatalogSearchTermsFromFields,
  type CatalogHints,
} from '@/lib/catalog/catalog-hints';
import type { HikkaAnimeRow } from '@/lib/catalog/providers/hikka/hikkaAnimeRow';
import { scoreHikkaCatalogHit } from '@/lib/catalog/providers/hikka/hikkaCatalogIdentity';
import { lookupHikkaSlugOverride } from '@/lib/catalog/providers/hikka/hikkaSlugOverrides';
import { hikkaIoFetch, hikkaIoUrl } from '@/lib/catalog/providers/hikka/hikkaIoFetch';

const SEARCH_MIN_SCORE = 70;

async function fetchHikkaAnimeByMal(malId: number): Promise<HikkaAnimeRow | null> {
  const res = await hikkaIoFetch(hikkaIoUrl(`/integrations/mal/anime/${malId}`));
  if (!res.ok) return null;
  return (await res.json()) as HikkaAnimeRow;
}

async function searchHikkaSlug(
  query: string,
  hints: CatalogHints,
  terms: string[],
): Promise<string | null> {
  const q = query.trim();
  if (!q) return null;
  const res = await hikkaIoFetch(hikkaIoUrl('/anime'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: q }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { list?: HikkaAnimeRow[] };
  const list = Array.isArray(data.list) ? data.list : [];
  if (!list.length) return null;

  let best: { slug: string; score: number } | null = null;
  for (const row of list) {
    const slug = row.slug?.trim();
    if (!slug) continue;
    const score = scoreHikkaCatalogHit(row, terms, hints);
    if (!best || score > best.score) best = { slug, score };
  }
  if (!best || best.score < SEARCH_MIN_SCORE) return null;
  return best.slug;
}

export async function resolveHikkaSlug(params: {
  malId?: number | null;
  title: string;
  romaji_title?: string;
  japanese_title?: string;
  synonyms?: string;
  hints: CatalogHints;
}): Promise<string | null> {
  const override = lookupHikkaSlugOverride(params.hints.anilistId);
  if (override) return override;

  const terms = buildCatalogSearchTermsFromFields({
    title: params.title,
    romaji_title: params.romaji_title,
    japanese_title: params.japanese_title,
    synonyms: params.synonyms,
  });

  if (params.malId != null && params.malId > 0) {
    const byMal = await fetchHikkaAnimeByMal(Math.floor(params.malId));
    const slug = byMal?.slug?.trim();
    if (byMal && slug && scoreHikkaCatalogHit(byMal, terms, params.hints) > 0) {
      return slug;
    }
  }

  for (const term of terms.slice(0, 4)) {
    const slug = await searchHikkaSlug(term, params.hints, terms);
    if (slug) return slug;
  }
  return null;
}
