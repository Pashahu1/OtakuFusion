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
  /** Загальна кількість епізодів з AniList (метадані). */
  episodeTotal?: string;
  /**
   * Кількість епізодів у каталозі з субами (після синку з API епізодів).
   * На картках: > 0 означає наявність Sub у каталозі.
   */
  has_sub?: number;
  /**
   * Кількість епізодів у каталозі з озвучкою.
   * На картках: > 0 означає наявність Dub.
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
  /** AniList averageScore (0–100), для hero-бейджа «78%». */
  scorePercent?: number;
  genres?: string[];
  malId?: number;
  /** TVDB clearlogo (як на anikage.cc), якщо є TVDB_API_KEY. */
  clearLogoUrl?: string;
  /** Підпис сезону в hero, якщо в назві/clearlogo його немає (напр. «Season 4»). */
  seasonLabel?: string;
  /** AniList synonyms — для TVDB-пошуку, у UI не показуємо. */
  synonyms?: string[];
}

export interface TrendingAnime {
  id: string;
  data_id: number;
  number: number;
  poster: string;
  title: string;
  japanese_title: string;
  /** Як у `AnimeInfo` — для карток у каруселі «Trending». */
  tvInfo?: TvInfo;
}

export interface ScheduleAnime {
  id: string;
  data_id: number;
  title: string;
  japanese_title: string;
  /** Постер з AniList `coverImage` (може бути порожнім рядком). */
  poster: string;
  /** AniList `MediaFormat` (TV, ONA тощо), якщо є. */
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
  /** Опційний ідентифікатор джерела (залежить від провайдера). */
  link_id?: string;
};

export interface NextEpisodeScheduleResult {
  nextEpisodeSchedule: string;
}
