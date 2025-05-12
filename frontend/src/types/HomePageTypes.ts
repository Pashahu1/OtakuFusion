import { AnimeBase, TimeRankedAnime } from "./GlobalTypes";

export interface HomePageType {
  genres?: string[];
  latestEpisodeAnimes?: AnimeBase[];
  spotlightAnimes?: AnimeBase[];
  top10Animes?: TimeRankedAnime;
  topAiringAnimes?: AnimeBase[];
  topUpcomingAnimes?: AnimeBase[];
  trendingAnimes?: AnimeBase[];
  mostPopularAnimes?: AnimeBase[];
  mostFavoriteAnimes?: AnimeBase[];
  latestCompletedAnimes?: AnimeBase[];
}
