/** How long data stays fresh (no refetch on remount while within this window). */
export const STALE_TIME = {
  favorites: 60_000,
  animeInfo: 5 * 60_000,
  animeSearch: 2 * 60_000,
  schedule: 5 * 60_000,
  homePage: 60 * 60_000,
} as const;
