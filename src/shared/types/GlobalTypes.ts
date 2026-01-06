export interface SeasonsType {
  id: string;
  data_number: number;
  data_id: number;
  season: string;
  title: string;
  japanese_title: string;
  season_poster: string;
}

export interface TvInfo {
  showType: string;
  duration: string;
  releaseDate: string;
  quality: string;
  sub: string;
  dub: string;
}

export interface SpotlightAnime {
  id: string;
  data_id: number;
  poster: string;
  title: string;
  japanese_title: string;
  description: string;
  tvInfo: TvInfo;
}

export interface TrendingAnime {
  id: string;
  data_id: number;
  number: number;
  poster: string;
  title: string;
  japanese_title: string;
}

export interface ScheduleAnime {
  id: string;
  data_id: number;
  title: string;
  japanese_title: string;
  releaseDate: string;
  time: string;
  episode_no: number;
}

export interface AnimeInfo {
  id: string;
  data_id: number;
  poster: string;
  title: string;
  japanese_title: string;
  description?: string;
  tvInfo?: TvInfo;
}

export type ServerType = {
  type: string;
  data_id: number;
  server_id: number;
  serverName: string;
};
