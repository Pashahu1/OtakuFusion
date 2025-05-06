export interface Episodes {
  sub: number;
  dub: number;
}

export interface AnimeBase {
  id: string;
  name: string;
  poster: string;
}

export interface AnimeWithTypeAndEpisodes extends AnimeBase {
  type: string;
  episodes: Episodes;
}

export interface SpotlightAnime extends AnimeBase {
  jname: string;
  description: string;
  rank: number;
  otherInfo: string[];
  episodes: Episodes;
}

export interface RankedAnime extends AnimeBase {
  rank: number;
  episodes: Episodes;
}

export interface AiringAnime extends AnimeBase {
  jname: string;
}

export interface UpcomingAnime extends AnimeWithTypeAndEpisodes {
  duration: string;
  rating: string;
}

export interface Top10Animes {
  today: RankedAnime[];
  week: RankedAnime[];
  month: RankedAnime[];
}

export interface HomePageType {
  genres: string[];
  latestEpisodeAnimes: AnimeWithTypeAndEpisodes[];
  spotlightAnimes: SpotlightAnime[];
  top10Animes: Top10Animes;
  topAiringAnimes: AiringAnime[];
  topUpcomingAnimes: UpcomingAnime[];
  trendingAnimes: RankedAnime[];
  mostPopularAnimes: AnimeWithTypeAndEpisodes[];
  mostFavoriteAnimes: AnimeWithTypeAndEpisodes[];
  latestCompletedAnimes: AnimeWithTypeAndEpisodes[];
}
