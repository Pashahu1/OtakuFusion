import {
  getAniListMediaPage,
  mapAniListMediaToAnimeInfo,
  mapAniListMediaToSpotlight,
  mapAniListMediaToTrending,
} from '@/lib/anilist';
import type { HomePageResponse } from '@/shared/types/HomePageTypes';

async function getHomePageFromAniList(): Promise<HomePageResponse['results']> {
  const [
    spotlightsPage,
    trendingPage,
    topAiringPage,
    mostPopularPage,
    mostFavoritePage,
    latestCompletedPage,
    latestEpisodePage,
  ] = await Promise.all([
    getAniListMediaPage({ perPage: 24, sort: ['TRENDING_DESC'] }),
    getAniListMediaPage({ perPage: 12, sort: ['TRENDING_DESC'] }),
    getAniListMediaPage({
      perPage: 20,
      sort: ['POPULARITY_DESC'],
      status: 'RELEASING',
    }),
    getAniListMediaPage({ perPage: 20, sort: ['POPULARITY_DESC'] }),
    getAniListMediaPage({ perPage: 20, sort: ['FAVOURITES_DESC'] }),
    getAniListMediaPage({
      perPage: 20,
      sort: ['END_DATE_DESC'],
      status: 'FINISHED',
    }),
    getAniListMediaPage({ perPage: 20, sort: ['START_DATE_DESC'] }),
  ]);

  const rawSpotlightsMedia = spotlightsPage.media ?? [];
  const spotlightsMedia = rawSpotlightsMedia
    .slice()
    .sort((a, b) => Number(Boolean(b.bannerImage)) - Number(Boolean(a.bannerImage)))
    .slice(0, 10);
  const trendingMedia = trendingPage.media ?? [];

  return {
    spotlights: spotlightsMedia.map(mapAniListMediaToSpotlight),
    trending: trendingMedia.map((media, index) =>
      mapAniListMediaToTrending(media, index)
    ),
    today: { schedule: [] },
    topAiring: (topAiringPage.media ?? []).map(mapAniListMediaToAnimeInfo),
    mostPopular: (mostPopularPage.media ?? []).map(mapAniListMediaToAnimeInfo),
    mostFavorite: (mostFavoritePage.media ?? []).map(mapAniListMediaToAnimeInfo),
    latestCompleted: (latestCompletedPage.media ?? []).map(
      mapAniListMediaToAnimeInfo
    ),
    latestEpisode: (latestEpisodePage.media ?? []).map(mapAniListMediaToAnimeInfo),
    genres: [],
  };
}

export const getHomePage = async (): Promise<
  HomePageResponse['results'] | null
> => {
  try {
    return await getHomePageFromAniList();
  } catch (err) {
    console.error('[getHomePage] AniList fallback failed:', err);
    return null;
  }
};
