export const TVDB_API = 'https://api4.thetvdb.com/v4';

/** TVDB v4: 1 = banner, 2 = poster, 3 = background / fanart */
export const TVDB_ARTWORK_BACKGROUND = 3;
export const TVDB_ARTWORK_BANNER = 1;

export const MIN_HERO_PIXEL_AREA = 1280 * 720;

export interface TvdbLoginResponse {
  data?: { token?: string };
}

export interface TvdbSearchHit {
  tvdb_id?: string;
  id?: string;
  name?: string;
  type?: string;
  primary_type?: string;
  translations?: Record<string, string>;
  aliases?: string[] | Array<{ name?: string; language?: string }>;
}

export interface TvdbArtwork {
  image?: string;
  type?: number;
  score?: number;
  width?: number;
  height?: number;
}

export interface TvdbClearLogoResult {
  url: string | null;
  matchedSeasonSpecific: boolean;
}

export interface TvdbSpotlightArtworkResult {
  clearLogoUrl: string | null;
  heroImageUrl: string | null;
  matchedSeasonSpecific: boolean;
}
