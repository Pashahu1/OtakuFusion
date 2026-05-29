/** Centralized query keys — one key = one React Query cache entry. */
export const queryKeys = {
  favorites: ['favorites'] as const,
  animeInfo: (id: string) => ['anime-info', id] as const,
  animeSearch: (keyword: string) => ['anime-search', keyword] as const,
  schedule: (date: string) => ['schedule', date] as const,
  homePage: ['home-page'] as const,
} as const;
