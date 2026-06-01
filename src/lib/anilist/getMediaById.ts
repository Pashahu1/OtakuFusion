import { assertAnimeMediaAllowed } from '@/lib/anime-content-policy';
import { ApiError } from '@/lib/errors/ApiError';

import { anilistRequest } from './client';
import type { AniListMedia } from './types';

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

async function fetchAniListMediaByIdUncached(parsedId: number): Promise<AniListMedia> {
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
