export interface SeasonsTypes {
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
  /** Total episode count from AniList (metadata). */
  episodeTotal?: string;
  /**
   * Episode count in catalog with subs (after episode API sync).
   * On cards: > 0 means Sub is available in catalog.
   */
  has_sub?: number;
  /**
   * Episode count in catalog with dub.
   * On cards: > 0 means Dub is available in catalog.
   */
  has_dub?: number;
  rating?: string;
}

export interface HomeTvInfo {
  showType: string;
  duration: string;
  releaseDate: string;
  quality: string;
  episodeInfo: TvInfo;
}

export interface SpotlightAnime {
  id: string;
  data_id: number;
  poster: string;
  title: string;
  japanese_title: string;
  description: string;
  tvInfo: TvInfo;
  /** AniList averageScore (0–100), for hero badge e.g. "78%". */
  scorePercent?: number;
  genres?: string[];
  malId?: number;
  /** TVDB clearlogo (as on anikage.cc), when TVDB_API_KEY is set. */
  clearLogoUrl?: string;
  /** TVDB fanart/background for hero (16:9), when TVDB_API_KEY is set. */
  heroImageUrl?: string;
  /** Season label in hero when missing from title/clearlogo (e.g. "Season 4"). */
  seasonLabel?: string;
  /** AniList synonyms — for TVDB search, not shown in UI. */
  synonyms?: string[];
}

export interface TrendingAnime {
  id: string;
  data_id: number;
  number: number;
  poster: string;
  title: string;
  japanese_title: string;
  /** Same as `AnimeInfo` — for cards in Trending carousel. */
  tvInfo?: TvInfo;
}

export interface ScheduleAnime {
  id: string;
  data_id: number;
  title: string;
  japanese_title: string;
  /** Poster from AniList `coverImage` (may be empty string). */
  poster: string;
  /** AniList `MediaFormat` (TV, ONA, etc.), when present. */
  format?: string;
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
  adultContent?: boolean;
}

export type ServerInfo = {
  type: string;
  data_id: number;
  server_id: number;
  serverName: string;
  /** Optional source identifier (provider-specific). */
  link_id?: string;
};

export interface NextEpisodeScheduleResult {
  nextEpisodeSchedule: string;
}
