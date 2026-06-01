export interface AniListTitle {
  romaji?: string | null;
  english?: string | null;
  native?: string | null;
}

export interface AniListCoverImage {
  extraLarge?: string | null;
  large?: string | null;
  medium?: string | null;
}

export interface AniListDate {
  year?: number | null;
  month?: number | null;
  day?: number | null;
}

export interface AniListMedia {
  id: number;
  idMal?: number | null;
  title?: AniListTitle | null;
  description?: string | null;
  coverImage?: AniListCoverImage | null;
  bannerImage?: string | null;
  format?: string | null;
  duration?: number | null;
  status?: string | null;
  episodes?: number | null;
  averageScore?: number | null;
  popularity?: number | null;
  favourites?: number | null;
  isAdult?: boolean | null;
  seasonYear?: number | null;
  startDate?: AniListDate | null;
  genres?: string[] | null;
  synonyms?: string[] | null;
  studios?: {
    nodes?: Array<{ name?: string | null }> | null;
  } | null;
  nextAiringEpisode?: {
    airingAt?: number | null;
    episode?: number | null;
  } | null;
  /** Latest streaming episodes from AniList metadata (often Crunchyroll format "Episode N - …"). */
  streamingEpisodes?: Array<{ title?: string | null } | null> | null;
  recommendations?: {
    nodes?: Array<{
      mediaRecommendation?: AniListMedia | null;
    }> | null;
  } | null;
  relations?: {
    nodes?: AniListMedia[] | null;
  } | null;
}

export interface AniListPageResponse {
  pageInfo?: {
    currentPage?: number | null;
    lastPage?: number | null;
    hasNextPage?: boolean | null;
    total?: number | null;
    perPage?: number | null;
  } | null;
  media?: AniListMedia[] | null;
}

interface AniListGraphQLError {
  message?: string;
}

export interface AniListResponse<TData> {
  data?: TData;
  errors?: AniListGraphQLError[];
}

export interface AniListPageParams {
  page?: number;
  perPage?: number;
  sort?: string[];
  status?: string;
  format?: string;
  genre?: string;
  search?: string;
}

export interface AniListAiringScheduleItem {
  episode?: number | null;
  airingAt?: number | null;
  media?: AniListMedia | null;
}

export interface AniListAiringPageResponse {
  airingSchedules?: AniListAiringScheduleItem[] | null;
}
