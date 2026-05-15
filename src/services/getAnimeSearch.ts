import { getAniListMediaPage, mapAniListMediaToSearchItem } from '@/lib/anilist';
import type { AnimeSearchItems } from '@/shared/types/AnimeSearchTypes';
import { buildAnimeSearchQueryVariants } from '@/services/buildAnimeSearchQueryVariants';

export async function getAnimeSearch(query: string): Promise<AnimeSearchItems[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const variants = buildAnimeSearchQueryVariants(trimmed);
  const byId = new Map<number, AnimeSearchItems>();
  const order: number[] = [];

  for (const search of variants) {
    const page = await getAniListMediaPage({
      search,
      perPage: 20,
      sort: ['SEARCH_MATCH'],
    });
    for (const m of page.media ?? []) {
      if (typeof m.id !== 'number' || !Number.isFinite(m.id)) continue;
      if (byId.has(m.id)) continue;
      byId.set(m.id, mapAniListMediaToSearchItem(m));
      order.push(m.id);
      if (order.length >= 20) return order.map((id) => byId.get(id)!);
    }
    if (order.length > 0) return order.map((id) => byId.get(id)!);
  }

  return [];
}
