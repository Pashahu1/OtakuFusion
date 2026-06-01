import { getAniListMediaPage, mapAniListMediaToAnimeInfo } from '@/lib/anilist';
import { getDiscoverSection } from '@/shared/data/discover-nav';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

const BROWSE_PAGE_SIZE = 24;

export interface DiscoverBrowseResult {
  items: AnimeInfo[];
  page: number;
  hasNextPage: boolean;
  lastPage: number;
}

export async function getDiscoverBrowsePage(input: {
  sectionId: string;
  page?: number;
}): Promise<DiscoverBrowseResult | null> {
  const section = getDiscoverSection(input.sectionId);
  if (!section) return null;

  const page = Math.max(1, input.page ?? 1);
  const anilistPage = await getAniListMediaPage({
    page,
    perPage: BROWSE_PAGE_SIZE,
    sort: section.sort,
    status: section.status,
    format: section.format,
  });

  const pageInfo = anilistPage.pageInfo;

  return {
    items: (anilistPage.media ?? []).map(mapAniListMediaToAnimeInfo),
    page,
    hasNextPage: Boolean(pageInfo?.hasNextPage),
    lastPage: pageInfo?.lastPage ?? page,
  };
}
