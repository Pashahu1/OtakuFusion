import { isBlockedGenreBrowseName } from '@/lib/anime-content-policy';
import { getAniListMediaPage, mapAniListMediaToAnimeInfo } from '@/lib/anilist';
import {
  GENRE_HUB_SECTIONS,
  getGenreSectionConfig,
  resolveBrowseAnilistFormat,
  type GenreBrowseSectionId,
  type GenreMediaFilter,
} from '@/shared/data/genre-hub';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

const HUB_ROW_SIZE = 14;
const BROWSE_PAGE_SIZE = 24;

export type GenreHubSectionData = Record<string, AnimeInfo[]>;

export async function getGenreHubSections(
  genre: string
): Promise<GenreHubSectionData | null> {
  if (!genre.trim() || isBlockedGenreBrowseName(genre)) return null;

  const rows = await Promise.all(
    GENRE_HUB_SECTIONS.map(async (section) => {
      const page = await getAniListMediaPage({
        genre,
        perPage: HUB_ROW_SIZE,
        sort: section.sort,
        format: section.format,
      });
      return {
        id: section.id,
        catalog: (page.media ?? []).map(mapAniListMediaToAnimeInfo),
      };
    })
  );

  const out: GenreHubSectionData = {};
  for (const row of rows) {
    out[row.id] = row.catalog;
  }
  return out;
}

export interface GenreBrowseResult {
  items: AnimeInfo[];
  page: number;
  hasNextPage: boolean;
  lastPage: number;
}

export async function getGenreBrowsePage(input: {
  genre: string;
  sectionId: GenreBrowseSectionId | string;
  media?: GenreMediaFilter;
  page?: number;
}): Promise<GenreBrowseResult | null> {
  const genre = input.genre.trim();
  if (!genre || isBlockedGenreBrowseName(genre)) return null;

  const section = getGenreSectionConfig(input.sectionId);
  if (!section) return null;

  const media = input.media ?? 'all';
  const page = Math.max(1, input.page ?? 1);
  const format = resolveBrowseAnilistFormat(section, media);

  const anilistPage = await getAniListMediaPage({
    genre,
    page,
    perPage: BROWSE_PAGE_SIZE,
    sort: section.sort,
    format,
  });

  const pageInfo = anilistPage.pageInfo;

  return {
    items: (anilistPage.media ?? []).map(mapAniListMediaToAnimeInfo),
    page,
    hasNextPage: Boolean(pageInfo?.hasNextPage),
    lastPage: pageInfo?.lastPage ?? page,
  };
}
