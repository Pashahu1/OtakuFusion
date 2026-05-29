import type { CatalogRequestBody } from '@/server/catalog/catalogRequestSchema';

/** POST catalog body — shared for match cache (source of truth: Zod schema). */
export type CatalogLookupBody = CatalogRequestBody;

export function catalogMatchCacheKey(body: CatalogLookupBody): string {
  return [
    body.anilistId.trim(),
    String(body.mal_id ?? ''),
    body.title.trim().toLowerCase(),
    (body.romaji_title ?? '').trim().toLowerCase(),
    (body.japanese_title ?? '').trim().toLowerCase(),
  ].join('|');
}
