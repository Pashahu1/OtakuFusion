/** Тіло POST catalog (Animepahe / Anilibria) — спільне для match cache. */
export interface CatalogLookupBody {
  anilistId: string;
  title: string;
  romaji_title?: string;
  japanese_title?: string;
  showType?: string;
  premiered?: string;
  episodeTotal?: string;
  mal_id?: number | null;
  synonyms?: string;
}

export function catalogMatchCacheKey(body: CatalogLookupBody): string {
  return [
    body.anilistId.trim(),
    String(body.mal_id ?? ''),
    body.title.trim().toLowerCase(),
    (body.romaji_title ?? '').trim().toLowerCase(),
    (body.japanese_title ?? '').trim().toLowerCase(),
  ].join('|');
}
