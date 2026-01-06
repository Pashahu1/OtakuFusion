import type {
  AnimeInfo,
  SpotlightAnime,
  TrendingAnime,
  ScheduleAnime,
} from "./GlobalTypes";

export interface HomePageType {
  genres: string[];
  latestEpisode: AnimeInfo[];
  spotlights: SpotlightAnime[];
  trending: TrendingAnime[];
  today: {
    schedule: ScheduleAnime[];
  };
  topAiring: AnimeInfo[];
  mostPopular: AnimeInfo[];
  mostFavorite: AnimeInfo[];
  latestCompleted: AnimeInfo[];
}
