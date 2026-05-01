import { getAniListMediaPage, mapAniListMediaToSearchItem } from '@/lib/anilist';
import type { AnimeSearchItems } from '@/shared/types/AnimeSearchTypes';

export const getAnimeSearch = async (
  query: string
): Promise<AnimeSearchItems[]> => {
  const page = await getAniListMediaPage({
    search: query,
    perPage: 20,
    sort: ['SEARCH_MATCH'],
  });
  return (page.media ?? []).map(mapAniListMediaToSearchItem);
};
