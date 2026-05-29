import type { CatalogRequestBody } from '@/server/catalog/catalogRequestSchema';

/** Тіло POST catalog — спільне для match cache (джерело правди: Zod schema). */
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
