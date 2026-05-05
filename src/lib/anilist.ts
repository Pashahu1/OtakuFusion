import { ApiError } from '@/lib/errors/ApiError';
import type {
  AnimeInfo,
  NextEpisodeScheduleResult,
  ScheduleAnime,
  SpotlightAnime,
  TrendingAnime,
  TvInfo,
} from '@/shared/types/GlobalAnimeTypes';
import type { AnimeSearchItems } from '@/shared/types/AnimeSearchTypes';
import type { AnimeData, AnimeResults } from '@/shared/types/animeDetailsTypes';

const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';

interface AniListTitle {
  romaji?: string | null;
  english?: string | null;
  native?: string | null;
}

interface AniListCoverImage {
  extraLarge?: string | null;
  large?: string | null;
  medium?: string | null;
}

interface AniListDate {
  year?: number | null;
  month?: number | null;
  day?: number | null;
}

interface AniListMedia {
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
  recommendations?: {
    nodes?: Array<{
      mediaRecommendation?: AniListMedia | null;
    }> | null;
  } | null;
  relations?: {
    nodes?: AniListMedia[] | null;
  } | null;
}

interface AniListPageResponse {
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

interface AniListResponse<TData> {
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

function pickTitle(title?: AniListTitle | null): string {
  return title?.english || title?.romaji || title?.native || 'Unknown title';
}

function toReleaseDate(startDate?: AniListDate | null): string {
  if (!startDate?.year) return '';
  const month = startDate.month ? String(startDate.month).padStart(2, '0') : '01';
  const day = startDate.day ? String(startDate.day).padStart(2, '0') : '01';
  return `${startDate.year}-${month}-${day}`;
}

function toTvInfo(media: AniListMedia): TvInfo {
  const hasEpisodes = typeof media.episodes === 'number' && media.episodes > 0;
  const releaseDate =
    typeof media.seasonYear === 'number'
      ? String(media.seasonYear)
      : toReleaseDate(media.startDate);

  return {
    showType: media.format ?? 'TV',
    duration:
      typeof media.duration === 'number' && media.duration > 0
        ? `${media.duration}m`
        : '',
    releaseDate,
    quality: 'HD',
    sub: hasEpisodes ? String(media.episodes) : '',
    dub: '',
    rating:
      typeof media.averageScore === 'number' && media.averageScore > 0
        ? `${media.averageScore / 10}/10`
        : undefined,
  };
}

function stripHtml(raw?: string | null): string {
  if (!raw) return '';
  return raw.replace(/<[^>]*>/g, '').trim();
}

function mapStatus(status?: string | null): string {
  if (!status) return '';
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(startDate?: AniListDate | null): string {
  const year = startDate?.year;
  if (!year) return '';
  const month = startDate.month ? String(startDate.month).padStart(2, '0') : '01';
  const day = startDate.day ? String(startDate.day).padStart(2, '0') : '01';
  return `${year}-${month}-${day}`;
}

export function mapAniListMediaToAnimeInfo(media: AniListMedia): AnimeInfo {
  return {
    id: String(media.id),
    data_id: media.id,
    poster:
      media.coverImage?.extraLarge ||
      media.coverImage?.large ||
      media.coverImage?.medium ||
      '',
    title: pickTitle(media.title),
    japanese_title: media.title?.native || media.title?.romaji || pickTitle(media.title),
    description: stripHtml(media.description),
    tvInfo: toTvInfo(media),
    adultContent: Boolean(media.isAdult),
  };
}

export function mapAniListMediaToAnimeDetails(media: AniListMedia): AnimeResults {
  const base = mapAniListMediaToAnimeInfo(media);
  const studios =
    media.studios?.nodes
      ?.map((item) => item?.name?.trim())
      .filter((name): name is string => Boolean(name)) ?? [];

  const recommendations =
    media.recommendations?.nodes
      ?.map((item) => item?.mediaRecommendation)
      .filter((item): item is AniListMedia => Boolean(item))
      .map(mapAniListMediaToAnimeInfo) ?? [];

  const related =
    media.relations?.nodes
      ?.filter((item): item is AniListMedia => Boolean(item))
      .map(mapAniListMediaToAnimeInfo) ?? [];

  const data: AnimeData = {
    id: String(media.id),
    data_id: media.id,
    mal_id: media.idMal ?? null,
    title: base.title,
    romaji_title: media.title?.romaji?.trim() || undefined,
    japanese_title: base.japanese_title,
    poster: base.poster,
    showType: media.format ?? 'TV',
    adultContent: Boolean(media.isAdult),
    animeInfo: {
      Overview: stripHtml(media.description),
      Japanese: media.title?.native || '',
      Synonyms: (media.synonyms ?? []).join(', '),
      Aired: formatDate(media.startDate),
      Premiered: media.seasonYear ? String(media.seasonYear) : '',
      Duration:
        typeof media.duration === 'number' && media.duration > 0
          ? `${media.duration}m`
          : '',
      Status: mapStatus(media.status),
      'MAL Score':
        typeof media.averageScore === 'number' && media.averageScore > 0
          ? String(media.averageScore / 10)
          : 'N/A',
      Genres: media.genres ?? [],
      Studios: studios,
      Producers: [],
      tvInfo: toTvInfo(media),
    },
    recommended_data: recommendations,
    related_data: related,
  };

  return {
    data,
    seasons: [],
  };
}

export function mapAniListMediaToSearchItem(media: AniListMedia): AnimeSearchItems {
  const base = mapAniListMediaToAnimeInfo(media);
  return {
    id: base.id,
    data_id: base.data_id,
    poster: base.poster,
    title: base.title,
    japanese_title: base.japanese_title,
    tvInfo: base.tvInfo || {
      showType: 'TV',
      duration: '',
      releaseDate: '',
      quality: 'HD',
      sub: '',
      dub: '',
    },
  };
}

export function mapAniListMediaToTrending(
  media: AniListMedia,
  index: number
): TrendingAnime {
  const base = mapAniListMediaToAnimeInfo(media);
  return {
    id: base.id,
    data_id: base.data_id,
    number: index + 1,
    poster: base.poster,
    title: base.title,
    japanese_title: base.japanese_title,
  };
}

export function mapAniListMediaToSpotlight(media: AniListMedia): SpotlightAnime {
  const base = mapAniListMediaToAnimeInfo(media);
  return {
    id: base.id,
    data_id: base.data_id,
    poster: media.bannerImage || base.poster,
    title: base.title,
    japanese_title: base.japanese_title,
    description: base.description || '',
    tvInfo: base.tvInfo || {
      showType: 'TV',
      duration: '',
      releaseDate: '',
      quality: 'HD',
      sub: '',
      dub: '',
    },
  };
}

export async function anilistRequest<TData>(
  query: string,
  variables?: Record<string, unknown>
): Promise<TData> {
  const response = await fetch(ANILIST_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new ApiError('AniList request failed', response.status);
  }

  const payload = (await response.json()) as AniListResponse<TData>;
  if (payload.errors?.length) {
    const message = payload.errors[0]?.message || 'AniList GraphQL error';
    throw new ApiError(message, 502);
  }
  if (!payload.data) {
    throw new ApiError('AniList returned empty payload', 502);
  }

  return payload.data;
}

export async function getAniListMediaPage(
  params: AniListPageParams
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

  return data.Page;
}

export async function getAniListMediaById(id: string): Promise<AniListMedia> {
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new ApiError('Invalid AniList id', 400);
  }

  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
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
        isAdult
        genres
        synonyms
        startDate {
          year
          month
          day
        }
        studios(isMain: true) {
          nodes {
            name
          }
        }
        recommendations(sort: RATING_DESC, perPage: 12) {
          nodes {
            mediaRecommendation {
              id
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
              isAdult
              startDate {
                year
                month
                day
              }
            }
          }
        }
        relations {
          nodes {
            id
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
            isAdult
            startDate {
              year
              month
              day
            }
          }
        }
        nextAiringEpisode {
          airingAt
          episode
        }
      }
    }
  `;

  const data = await anilistRequest<{ Media: AniListMedia | null }>(query, {
    id: parsedId,
  });

  if (!data.Media) {
    throw new ApiError('Anime not found in AniList', 404);
  }

  return data.Media;
}

export function mapAniListMediaToNextEpisodeSchedule(
  media: AniListMedia
): NextEpisodeScheduleResult {
  const airingAt = media.nextAiringEpisode?.airingAt;
  const nextEpisode = media.nextAiringEpisode?.episode;
  if (!airingAt || !nextEpisode) {
    return { nextEpisodeSchedule: '' };
  }

  return {
    nextEpisodeSchedule: new Date(airingAt * 1000).toISOString(),
  };
}

interface AniListAiringScheduleItem {
  episode?: number | null;
  airingAt?: number | null;
  media?: AniListMedia | null;
}

interface AniListAiringPageResponse {
  airingSchedules?: AniListAiringScheduleItem[] | null;
}

export async function getAniListScheduleByDate(
  date: string
): Promise<ScheduleAnime[]> {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);
  const from = Math.floor(start.getTime() / 1000);
  const to = Math.floor(end.getTime() / 1000);

  const query = `
    query ($from: Int, $to: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        airingSchedules(
          airingAt_greater: $from
          airingAt_lesser: $to
          sort: TIME
        ) {
          episode
          airingAt
          media {
            id
            title {
              romaji
              english
              native
            }
          }
        }
      }
    }
  `;

  const data = await anilistRequest<{ Page: AniListAiringPageResponse }>(query, {
    from,
    to,
    page: 1,
    perPage: 50,
  });

  const schedules = data.Page.airingSchedules ?? [];

  return schedules
    .filter((item): item is AniListAiringScheduleItem => Boolean(item.media?.id))
    .map((item) => {
      const airing = new Date((item.airingAt ?? 0) * 1000);
      const pad = (value: number): string => String(value).padStart(2, '0');
      const releaseDate = `${airing.getUTCFullYear()}-${pad(airing.getUTCMonth() + 1)}-${pad(airing.getUTCDate())}`;
      const time = `${pad(airing.getUTCHours())}:${pad(airing.getUTCMinutes())}:00`;
      return {
        id: String(item.media?.id ?? ''),
        data_id: item.media?.id ?? 0,
        title: pickTitle(item.media?.title),
        japanese_title:
          item.media?.title?.native || item.media?.title?.romaji || pickTitle(item.media?.title),
        releaseDate,
        time,
        episode_no: item.episode ?? 0,
      };
    });
}
