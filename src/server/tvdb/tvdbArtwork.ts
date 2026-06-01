import {
  MIN_HERO_PIXEL_AREA,
  TVDB_ARTWORK_BACKGROUND,
  TVDB_ARTWORK_BANNER,
  type TvdbArtwork,
  type TvdbSpotlightArtworkResult,
} from './tvdbTypes';
import { tvdbFetchJson, tvdbSeriesArtworksUrl } from './tvdbApi';

function isTvdbThumbnailUrl(url: string): boolean {
  return /_t\.(jpg|jpeg|png|webp)$/i.test(url);
}

function artworkPixelArea(art: TvdbArtwork): number {
  const w = art.width ?? 0;
  const h = art.height ?? 0;
  return w > 0 && h > 0 ? w * h : 0;
}

function compareArtworksForHero(a: TvdbArtwork, b: TvdbArtwork): number {
  const areaA = artworkPixelArea(a);
  const areaB = artworkPixelArea(b);
  const aMeets = areaA >= MIN_HERO_PIXEL_AREA;
  const bMeets = areaB >= MIN_HERO_PIXEL_AREA;
  if (aMeets !== bMeets) return aMeets ? -1 : 1;
  if (areaA !== areaB) return areaB - areaA;

  const typeRank = (type: number) =>
    type === TVDB_ARTWORK_BACKGROUND ? 2 : type === TVDB_ARTWORK_BANNER ? 1 : 0;
  const typeDiff = typeRank(b.type ?? 0) - typeRank(a.type ?? 0);
  if (typeDiff !== 0) return typeDiff;

  return (b.score ?? 0) - (a.score ?? 0);
}

function isHeroBackdropCandidate(art: TvdbArtwork): boolean {
  const url = art.image?.trim();
  if (!url || isTvdbThumbnailUrl(url)) return false;

  const type = art.type ?? 0;
  if (type === TVDB_ARTWORK_BACKGROUND) return true;

  if (type === TVDB_ARTWORK_BANNER) {
    const area = artworkPixelArea(art);
    if (area >= MIN_HERO_PIXEL_AREA) return true;
    const w = art.width ?? 0;
    const h = art.height ?? 0;
    return w > h && w >= 1000;
  }

  return url.includes('/fanart/original/');
}

function pickClearLogoFromArtworks(artworks: TvdbArtwork[]): string | null {
  const clear = artworks.filter((art) => art.image?.includes('/clearlogo/'));
  if (!clear.length) return null;

  clear.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return clear[0]?.image?.trim() ?? null;
}

function pickHeroBackdropFromArtworks(artworks: TvdbArtwork[]): string | null {
  const candidates = artworks.filter(isHeroBackdropCandidate);
  if (!candidates.length) return null;

  candidates.sort(compareArtworksForHero);
  return candidates[0]?.image?.trim() ?? null;
}

export function pickSpotlightArtworkFromList(
  artworks: TvdbArtwork[],
): Pick<TvdbSpotlightArtworkResult, 'clearLogoUrl' | 'heroImageUrl'> {
  return {
    clearLogoUrl: pickClearLogoFromArtworks(artworks),
    heroImageUrl: pickHeroBackdropFromArtworks(artworks),
  };
}

export async function fetchSeriesArtworks(
  token: string,
  seriesId: string,
): Promise<TvdbArtwork[]> {
  const artJson = await tvdbFetchJson<{
    data?: { artworks?: TvdbArtwork[] } | TvdbArtwork[];
  }>(tvdbSeriesArtworksUrl(seriesId), token, 60 * 60 * 24 * 7);

  const raw = artJson?.data;
  return Array.isArray(raw) ? raw : Array.isArray(raw?.artworks) ? raw.artworks : [];
}
