import type { SpotlightAnime } from '@/shared/types/GlobalAnimeTypes';

export function isAniListImage(url: string): boolean {
  return url.includes('anilist.co') || url.includes('s4.anilist.co');
}

export function heroSlideUsesAniListSource(anime: SpotlightAnime): boolean {
  return !anime.heroImageUrl?.trim() && isAniListImage(anime.poster);
}
