export interface AnimeItem {
  id: string;
  title: string;
  alternativeTitle: string;
  poster: string;
  rank: number;
  type: "TV" | "Movie" | "OVA" | "ONA" | "Special" | "Unknown";
  quality: "HD" | "SD" | "FHD" | string;
  duration: string;
  aired: string;
  synopsis: string;
  episodes: AnimeEpisodes;
}

export interface AnimeEpisodes {
  sub: number;
  dub: number;
  eps: number;
}

export interface Top10 {
  today: AnimeItem[];
  week: AnimeItem[];
  month: AnimeItem[];
}

export interface HomeCatalogData {
  spotlight: AnimeItem[];
  trending: AnimeItem[];
  topAiring: AnimeItem[];
  mostPopular: AnimeItem[];
  mostFavorite: AnimeItem[];
  latestCompleted: AnimeItem[];
  latestEpisode: AnimeItem[];
  newAdded: AnimeItem[];
  topUpcoming: AnimeItem[];
  top10: Top10;
  genres: string[];
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

export interface PageInfo {
  currentPage: number;
  hasNextPage: boolean;
  totalPages: number;
}

export interface AZList {
  response: AnimeItem[];
  pageInfo: PageInfo;
}

export interface SearchList {}
