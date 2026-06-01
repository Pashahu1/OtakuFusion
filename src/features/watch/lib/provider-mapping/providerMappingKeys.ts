import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

const MAPPING_KEY = {
  animepahe: (localAnimeId: string) => `animepahe:mapping:${localAnimeId}`,
  aniliberty: (localAnimeId: string) => `aniliberty:mapping:${localAnimeId}`,
  hikka: (localAnimeId: string) => `hikka:mapping:${localAnimeId}`,
} as const;

export const LIBERTY_EPISODES_KEY = (localAnimeId: string) =>
  `aniliberty:episodes:${localAnimeId.trim()}`;

export const LIBERTY_EPISODES_TTL_MS = 45 * 60 * 1000;

export function getMappingCacheKey(
  localAnimeId: string,
  provider: WatchStreamProvider,
): string {
  if (provider === 'aniliberty') return MAPPING_KEY.aniliberty(localAnimeId);
  if (provider === 'hikka') return MAPPING_KEY.hikka(localAnimeId);
  return MAPPING_KEY.animepahe(localAnimeId);
}
