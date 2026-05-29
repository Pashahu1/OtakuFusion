import type { AnimeInfo, SeasonsTypes, TvInfo } from "./GlobalAnimeTypes";

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
  mal_id: number | null;
  title: string;
  /**
   * Episode titles from AniList `streamingEpisodes` (key — episode number as string).
   * Watch list uses `applyAnilistEpisodeDisplayTitles`: map string or fallback "title - Episode N".
   */
  anilistEpisodeTitles?: Record<string, string>;
  /** AniList `title.romaji` — more reliable for catalog source matching than English localization. */
  romaji_title?: string;
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
  Producers: string[]
  tvInfo: TvInfo;
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

