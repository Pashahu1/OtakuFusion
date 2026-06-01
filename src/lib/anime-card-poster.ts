/** Same hints as `.swiper-card__slide` / `SwiperCard` for `next/image` `sizes`. */
export const ANIME_CAROUSEL_POSTER_SIZES =
  '(max-width: 635px) 152px, (max-width: 1023px) 28vw, (max-width: 1410px) 22vw, 315px';

export const ANIME_CAROUSEL_POSTER_QUALITY = 55;

/** Browse grids: first row (up to ~6 on lg) — eager load + LCP-friendly. */
export const ABOVE_THE_FOLD_CARD_COUNT = 6;

export const ANIME_GRID_POSTER_QUALITY = 58;

/** Watch series hero — darkened banner; lower q saves ~90 KiB vs 82. */
export const WATCH_HERO_BG_QUALITY = 68;

/** Episode grid thumbnails on /watch/[id]. */
export const WATCH_EPISODE_THUMB_QUALITY = 58;

/** Next-episode card on /watch/[id]/play (~160px wide). */
export const WATCH_PLAY_NEXT_THUMB_QUALITY = 52;
