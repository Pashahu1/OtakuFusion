export interface AnimeItem {
  id: string;
  title: string;
  image: string;
  [key: string]: any; // на випадок, якщо ще є якісь поля
}

export interface Top10 {
  today: AnimeItem[];
  week: AnimeItem[];
  month: AnimeItem[];
}

export interface HomeCatalog {
  genres: string[];
  latestCompleted: AnimeItem[];
  latestEpisode: AnimeItem[];
  mostFavorite: AnimeItem[];
  mostPopular: AnimeItem[];
  newAdded: AnimeItem[];
  spotlight: AnimeItem[];
  top10: Top10;
  topAiring: AnimeItem[];
  topUpcoming: AnimeItem[];
  trending: AnimeItem[];
}

export interface Episodes {
  sub: number;
  dub: number;
  eps: number;
}

export interface AnimeCard {
  alternativeTitle: string;
  episodes: Episodes;
  id: string;
  poster: string;
  title: string;
  type: string;
}

export interface Aired {
  from: string;
  to: string | null;
}

export interface AnimeDetails {
  title: string;
  alternativeTitle: string;
  japanese: string;
  id: string;
  poster: string;
  rating: string;
  type: string;
  episodes: Episodes;
  synopsis: string;
  synonyms: string;
  aired: Aired;
  premiered: string;
  duration: string;
  status: string;
  MAL_score: string;
  genres: string[];
  studios: string;
  producers: string[];
}

export interface AnimeDetailsResponse {
  status: boolean;
  data: AnimeDetails;
}

export interface Episode {
  title: string;
  episodeId: string;
  number: number;
  isFiller: boolean;
}

export interface EpisodesResponse {
  status: boolean;
  episodes: {
    totalEpisodes: number;
    episodes: Episode[];
  };
}

export interface ServerData {
  serverName: string;
  serverId: number;
}

export interface EpisodeData {
  episodeId: string;
  episodeNo: number;
  sub: ServerData[];
  dub: ServerData[];
  raw: ServerData[];
}
