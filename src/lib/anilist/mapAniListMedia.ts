import { filterAniListMediaArray } from '@/lib/anime-content-policy';
import type {
  AnimeInfo,
  NextEpisodeScheduleResult,
  SpotlightAnime,
  TrendingAnime,
} from '@/shared/types/GlobalAnimeTypes';
import type { AnimeSearchItems } from '@/shared/types/AnimeSearchTypes';
import type { AnimeData, AnimeResults } from '@/shared/types/animeDetailsTypes';

import type { AniListMedia } from './types';
import {
  buildAnilistEpisodeTitleRecord,
  formatDate,
  mapStatus,
  pickTitle,
  stripHtml,
  toTvInfo,
} from './mediaHelpers';

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
        .filter((item): item is AniListMedia => Boolean(item)) ?? [],
    ).map(mapAniListMediaToAnimeInfo);

  const related = filterAniListMediaArray(
    media.relations?.nodes?.filter((item): item is AniListMedia => Boolean(item)) ??
      [],
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
  index: number,
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

export function mapAniListMediaToNextEpisodeSchedule(
  media: AniListMedia,
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
