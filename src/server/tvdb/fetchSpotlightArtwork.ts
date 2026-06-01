import { unstable_cache } from 'next/cache';

import {
  buildTvdbSearchTitles,
  resolveSpotlightSeasonLabel,
  stripSeasonFromTitle,
} from '@/shared/utils/resolveAnimeSeasonLabel';

import { getTvdbApiKey, tvdbLogin } from './tvdbAuth';
import { fetchSeriesArtworks, pickSpotlightArtworkFromList } from './tvdbArtwork';
import {
  hitMentionsSeason,
  pickBestSeriesHit,
  resolveTvdbSeasonNumber,
  searchTvdbSeriesHit,
  seriesIdFromHit,
} from './tvdbSearch';
import { TVDB_API, type TvdbSearchHit, type TvdbSpotlightArtworkResult } from './tvdbTypes';
import { tvdbFetchJson } from './tvdbApi';

const emptySpotlightArtwork: TvdbSpotlightArtworkResult = {
  clearLogoUrl: null,
  heroImageUrl: null,
  matchedSeasonSpecific: false,
};

async function tryQueryForSpotlightArtwork(
  token: string,
  query: string,
  season: number | null,
  requireSeasonInHit: boolean,
  franchiseBase: string,
): Promise<TvdbSpotlightArtworkResult | null> {
  const hit = await searchTvdbSeriesHit(token, query, season, franchiseBase);
  if (!hit) return null;

  const mentionsSeason = season ? hitMentionsSeason(hit, season) : false;
  if (requireSeasonInHit && season && !mentionsSeason) return null;

  const seriesId = seriesIdFromHit(hit);
  if (!seriesId) return null;

  const artworks = await fetchSeriesArtworks(token, seriesId);
  const { clearLogoUrl, heroImageUrl } = pickSpotlightArtworkFromList(artworks);
  if (!clearLogoUrl && !heroImageUrl) return null;

  return {
    clearLogoUrl,
    heroImageUrl,
    matchedSeasonSpecific: Boolean(season && mentionsSeason),
  };
}

async function fetchSpotlightArtworkUncached(input: {
  title: string;
  malId?: number;
  description?: string;
  synonyms?: string[];
}): Promise<TvdbSpotlightArtworkResult> {
  const apiKey = getTvdbApiKey();
  if (!apiKey) return emptySpotlightArtwork;

  const token = await tvdbLogin(apiKey);
  if (!token) return emptySpotlightArtwork;

  const season = resolveTvdbSeasonNumber({
    title: input.title,
    description: input.description,
    synonyms: input.synonyms,
  });

  const searchTitles = buildTvdbSearchTitles({
    title: input.title,
    description: input.description,
    synonyms: input.synonyms,
  });

  const franchiseBase = stripSeasonFromTitle(input.title);

  if (season) {
    for (const query of searchTitles) {
      const hit = await tryQueryForSpotlightArtwork(
        token,
        query,
        season,
        true,
        franchiseBase,
      );
      if (hit) return hit;
    }
  }

  for (const query of searchTitles) {
    const hit = await tryQueryForSpotlightArtwork(
      token,
      query,
      season,
      false,
      franchiseBase,
    );
    if (hit) return hit;
  }

  if (input.malId && input.malId > 0) {
    const malSearch = await tvdbFetchJson<{ data?: TvdbSearchHit[] }>(
      `${TVDB_API}/search?query=${input.malId}&limit=10`,
      token,
      60 * 60 * 24 * 7,
    );
    const malHit = pickBestSeriesHit(
      malSearch?.data ?? [],
      input.title,
      season,
      franchiseBase,
    );
    const seriesId = malHit ? seriesIdFromHit(malHit) : null;
    if (seriesId) {
      const artworks = await fetchSeriesArtworks(token, seriesId);
      const picked = pickSpotlightArtworkFromList(artworks);
      if (picked.clearLogoUrl || picked.heroImageUrl) {
        return {
          ...picked,
          matchedSeasonSpecific: Boolean(
            season && malHit && hitMentionsSeason(malHit, season),
          ),
        };
      }
    }
  }

  return emptySpotlightArtwork;
}

export async function fetchTvdbSpotlightArtwork(input: {
  title: string;
  malId?: number;
  description?: string;
  synonyms?: string[];
}): Promise<TvdbSpotlightArtworkResult> {
  const title = input.title?.trim();
  if (!title) return emptySpotlightArtwork;
  if (!getTvdbApiKey()) return emptySpotlightArtwork;

  const cacheKey = [
    'tvdb-spotlight-art-v1',
    title.toLowerCase(),
    input.malId ? String(input.malId) : 'no-mal',
    input.description?.slice(0, 40) ?? '',
  ];

  return unstable_cache(
    () => fetchSpotlightArtworkUncached(input),
    cacheKey,
    { revalidate: 60 * 60 * 24 * 7 },
  )();
}

export async function fetchTvdbClearLogoUrl(input: {
  title: string;
  malId?: number;
  description?: string;
  synonyms?: string[];
}) {
  const result = await fetchTvdbSpotlightArtwork(input);
  return {
    url: result.clearLogoUrl,
    matchedSeasonSpecific: result.matchedSeasonSpecific,
  };
}

export async function enrichSpotlightsWithClearLogos<
  T extends {
    title: string;
    description?: string;
    malId?: number;
    clearLogoUrl?: string;
    heroImageUrl?: string;
    seasonLabel?: string;
    synonyms?: string[];
  },
>(spotlights: T[]): Promise<T[]> {
  if (!getTvdbApiKey()) return spotlights;

  return Promise.all(
    spotlights.map(async (spotlight) => {
      const synonyms = spotlight.synonyms;
      const { clearLogoUrl, heroImageUrl, matchedSeasonSpecific } =
        await fetchTvdbSpotlightArtwork({
          title: spotlight.title,
          malId: spotlight.malId,
          description: spotlight.description,
          synonyms,
        });

      const seasonLabel = resolveSpotlightSeasonLabel({
        title: spotlight.title,
        description: spotlight.description,
        synonyms,
        tvdbMatchedSeason: matchedSeasonSpecific,
      });

      return {
        ...spotlight,
        ...(clearLogoUrl ? { clearLogoUrl } : {}),
        ...(heroImageUrl ? { heroImageUrl } : {}),
        ...(seasonLabel ? { seasonLabel } : { seasonLabel: undefined }),
      };
    }),
  );
}
