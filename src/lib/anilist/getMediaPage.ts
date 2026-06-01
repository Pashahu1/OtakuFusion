import { filterAniListMediaArray } from '@/lib/anime-content-policy';

import { anilistRequest } from './client';
import type { AniListPageParams, AniListPageResponse } from './types';

export async function getAniListMediaPage(
  params: AniListPageParams,
): Promise<AniListPageResponse> {
  const query = `
    query (
      $page: Int
      $perPage: Int
      $sort: [MediaSort]
      $status: MediaStatus
      $format: MediaFormat
      $genre: String
      $search: String
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          currentPage
          hasNextPage
          lastPage
          total
          perPage
        }
        media(
          type: ANIME
          sort: $sort
          status: $status
          format: $format
          genre: $genre
          search: $search
        ) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          description(asHtml: false)
          coverImage {
            extraLarge
            large
            medium
          }
          bannerImage
          format
          duration
          status
          episodes
          averageScore
          seasonYear
          genres
          synonyms
          isAdult
          startDate {
            year
            month
            day
          }
        }
      }
    }
  `;

  const data = await anilistRequest<{ Page: AniListPageResponse }>(query, {
    page: params.page ?? 1,
    perPage: params.perPage ?? 20,
    sort: params.sort ?? ['POPULARITY_DESC'],
    status: params.status,
    format: params.format,
    genre: params.genre,
    search: params.search,
  });

  const page = data.Page;
  return {
    ...page,
    media: filterAniListMediaArray(page.media),
  };
}

/** Lightweight query for search page (no description/banner). */
export async function getAniListSearchPage(params: {
  search: string;
  page?: number;
  perPage?: number;
}): Promise<AniListPageResponse> {
  const query = `
    query ($page: Int, $perPage: Int, $search: String) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          currentPage
          hasNextPage
          lastPage
          total
          perPage
        }
        media(type: ANIME, sort: [SEARCH_MATCH], search: $search) {
          id
          title {
            romaji
            english
            native
          }
          synonyms
          coverImage {
            extraLarge
            large
            medium
          }
          format
          duration
          status
          episodes
          averageScore
          popularity
          favourites
          seasonYear
          isAdult
          startDate {
            year
            month
            day
          }
        }
      }
    }
  `;

  const data = await anilistRequest<{ Page: AniListPageResponse }>(query, {
    page: params.page ?? 1,
    perPage: params.perPage ?? 24,
    search: params.search,
  });

  const page = data.Page;
  return {
    ...page,
    media: filterAniListMediaArray(page.media),
  };
}
