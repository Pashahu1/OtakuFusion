import {
  assertAnimeMediaAllowed,
  filterAniListMediaArray,
  isBlockedAnimeMedia,
} from '@/lib/anime-content-policy';
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

/** In browser AniList blocks CORS for third-party origins — use `/api/anilist/graphql`. */
function getAnilistGraphqlFetchUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api/anilist/graphql';
  }
  return ANILIST_GRAPHQL_URL;
}

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

/**
 * Extract episode number from `streamingEpisodes` string (various Crunchyroll / other formats).
 * Returns [number as string, full raw string for map].
 */
function parseStreamingEpisodeNumber(raw: string): [string, string] | null {
  const t = raw.trim();
  if (!t) return null;
  const patterns: RegExp[] = [
    /^\s*(?:Episode|Ep\.?)\s*#?\s*(\d+)\b/i,
    /^\s*(\d+)\s*[.:\-|–—]\s+\S/,
    /^\s*#?\s*(\d+)\s+[–—\-]\s+\S/,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (m?.[1] && /^\d+$/.test(m[1])) return [m[1], t];
  }
  return null;
}

/** Build map episode number → string from `streamingEpisodes` (first match per number). */
function buildAnilistEpisodeTitleRecord(
  streaming?: ReadonlyArray<{ title?: string | null } | null> | null
): Record<string, string> | undefined {
  if (!Array.isArray(streaming) || !streaming.length) return undefined;
  const out: Record<string, string> = {};
  for (const row of streaming) {
    const raw = row?.title?.trim();
    if (!raw) continue;
    const parsed = parseStreamingEpisodeNumber(raw);
    if (!parsed) continue;
    const [numKey] = parsed;
    if (out[numKey]) continue;
    out[numKey] = raw;
  }
  return Object.keys(out).length ? out : undefined;
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
    episodeTotal: hasEpisodes ? String(media.episodes) : undefined,
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
  const genres =
    media.genres?.filter((g): g is string => Boolean(g?.trim())) ?? [];
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
    genres,
  };
}

export function mapAniListMediaToAnimeDetails(media: AniListMedia): AnimeResults {
  const base = mapAniListMediaToAnimeInfo(media);
  const studios =
    media.studios?.nodes
      ?.map((item) => item?.name?.trim())
      .filter((name): name is string => Boolean(name)) ?? [];

  const recommendations =
    filterAniListMediaArray(
      media.recommendations?.nodes
        ?.map((item) => item?.mediaRecommendation)
        .filter((item): item is AniListMedia => Boolean(item)) ?? []
    ).map(mapAniListMediaToAnimeInfo);

  const related = filterAniListMediaArray(
    media.relations?.nodes?.filter((item): item is AniListMedia => Boolean(item)) ??
      []
  ).map(mapAniListMediaToAnimeInfo);

  const data: AnimeData = {
    id: String(media.id),
    data_id: media.id,
    mal_id: media.idMal ?? null,
    title: base.title,
    anilistEpisodeTitles: buildAnilistEpisodeTitleRecord(media.streamingEpisodes),
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
    tvInfo: base.tvInfo,
  };
}

export function mapAniListMediaToSpotlight(media: AniListMedia): SpotlightAnime {
  const base = mapAniListMediaToAnimeInfo(media);
  const description = base.description || '';
  const synonyms = media.synonyms?.filter((s): s is string => Boolean(s?.trim()));

  return {
    id: base.id,
    data_id: base.data_id,
    poster: media.bannerImage || base.poster,
    title: base.title,
    japanese_title: base.japanese_title,
    description,
    tvInfo: base.tvInfo || {
      showType: 'TV',
      duration: '',
      releaseDate: '',
      quality: 'HD',
    },
    scorePercent:
      typeof media.averageScore === 'number' && media.averageScore > 0
        ? media.averageScore
        : undefined,
    genres: media.genres?.filter((g): g is string => Boolean(g?.trim())).slice(0, 4),
    malId:
      typeof media.idMal === 'number' && media.idMal > 0
        ? Math.floor(media.idMal)
        : undefined,
    synonyms,
  };
}

async function anilistRequestOnce<TData>(
  query: string,
  variables?: Record<string, unknown>
): Promise<TData> {
  const url = getAnilistGraphqlFetchUrl();
  const isBrowser = typeof window !== 'undefined';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    ...(isBrowser ? {} : { next: { revalidate: 900 } }),
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

function anilistRetryDelayMs(status: number, attempt: number): number {
  if (status === 429) return 1200 + attempt * 800;
  return 0;
}

export async function anilistRequest<TData>(
  query: string,
  variables?: Record<string, unknown>
): Promise<TData> {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await anilistRequestOnce<TData>(query, variables);
    } catch (err) {
      lastError = err;
      const status = err instanceof ApiError ? err.status : 0;
      const delayMs = anilistRetryDelayMs(status, attempt);
      if (delayMs <= 0 || attempt >= maxAttempts - 1) break;
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }
  }

  throw lastError;
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

const ANILIST_MEDIA_BY_ID_TTL_MS = 12 * 60 * 1000;
const anilistMediaByIdCache = new Map<
  number,
  { media: AniListMedia; cachedAt: number }
>();
const anilistMediaByIdInFlight = new Map<number, Promise<AniListMedia>>();

export async function getAniListMediaById(id: string): Promise<AniListMedia> {
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new ApiError('Invalid AniList id', 400);
  }

  const cached = anilistMediaByIdCache.get(parsedId);
  if (cached && Date.now() - cached.cachedAt < ANILIST_MEDIA_BY_ID_TTL_MS) {
    return cached.media;
  }

  const inflight = anilistMediaByIdInFlight.get(parsedId);
  if (inflight) return inflight;

  const promise = fetchAniListMediaByIdUncached(parsedId)
    .then((media) => {
      anilistMediaByIdCache.set(parsedId, { media, cachedAt: Date.now() });
      return media;
    })
    .finally(() => {
      if (anilistMediaByIdInFlight.get(parsedId) === promise) {
        anilistMediaByIdInFlight.delete(parsedId);
      }
    });

  anilistMediaByIdInFlight.set(parsedId, promise);
  return promise;
}

async function fetchAniListMediaByIdUncached(
  parsedId: number
): Promise<AniListMedia> {
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
        streamingEpisodes {
          title
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

  assertAnimeMediaAllowed(data.Media);
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
            format
            isAdult
            genres
            coverImage {
              extraLarge
              large
              medium
            }
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
    .filter(
      (item): item is AniListAiringScheduleItem =>
        Boolean(item.media?.id) && !isBlockedAnimeMedia(item.media ?? {})
    )
    .map((item) => {
      const airing = new Date((item.airingAt ?? 0) * 1000);
      const pad = (value: number): string => String(value).padStart(2, '0');
      const releaseDate = `${airing.getUTCFullYear()}-${pad(airing.getUTCMonth() + 1)}-${pad(airing.getUTCDate())}`;
      const time = `${pad(airing.getUTCHours())}:${pad(airing.getUTCMinutes())}:00`;
      const media = item.media;
      const poster =
        media?.coverImage?.extraLarge ||
        media?.coverImage?.large ||
        media?.coverImage?.medium ||
        '';
      const formatRaw = media?.format?.trim();
      return {
        id: String(media?.id ?? ''),
        data_id: media?.id ?? 0,
        title: pickTitle(media?.title),
        japanese_title:
          media?.title?.native || media?.title?.romaji || pickTitle(media?.title),
        poster,
        ...(formatRaw ? { format: formatRaw } : {}),
        releaseDate,
        time,
        episode_no: item.episode ?? 0,
      };
    });
}
