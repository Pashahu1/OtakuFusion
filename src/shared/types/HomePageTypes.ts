import type {
  AnimeInfo,
  SpotlightAnime,
  TrendingAnime,
  ScheduleAnime,
} from "./GlobalAnimeTypes";

export interface HomePageResponse {
  success: boolean;
  results: {
    spotlights: SpotlightAnime[];
    trending: TrendingAnime[];
    today: {
      schedule: ScheduleAnime[];
    };
    topAiring: AnimeInfo[];
    mostPopular: AnimeInfo[];
    mostFavorite: AnimeInfo[];
    latestCompleted: AnimeInfo[];
    latestEpisode: AnimeInfo[];
    genres: string[];
  };
}
