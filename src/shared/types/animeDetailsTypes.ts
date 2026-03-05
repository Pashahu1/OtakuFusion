import type { AnimeInfo, SeasonsTypes } from "./GlobalAnimeTypes";

export interface AnimeApiResponse {
  success: boolean;
  results: AnimeResults;
}

export interface AnimeResults {
  data: AnimeData;
  seasons: SeasonsTypes[];
}

export interface AnimeData {
  adultContent: boolean;
  id: string;
  data_id: number;
  title: string;
  japanese_title: string;
  poster: string;
  showType: string;
  animeInfo: AnimeDetailsInfo; 
  recommended_data: AnimeInfo[];
  related_data: AnimeInfo[];
}

export interface AnimeDetailsInfo {
  Overview: string;
  Japanese: string;
  Synonyms: string;
  Aired: string;
  Premiered: string;
  Duration: string;
  Status: string;
  "MAL Score": string;
  Genres: string[];
  Studios: string[];
  Producers: string[];
}

export interface AnimeSeason {
  id: string;
  data_number: number;
  data_id: number;
  season: string;
  title: string;
  japanese_title: string;
  season_poster: string;
}
