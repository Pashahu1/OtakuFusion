import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

const MAPPING_KEY = {
  aniliberty: (localAnimeId: string) => `aniliberty:mapping:${localAnimeId}`,
  hikka: (localAnimeId: string) => `hikka:mapping:${localAnimeId}`,
  anikoto: (localAnimeId: string) => `anikoto:mapping:${localAnimeId}`,
} as const;

export const ANIKOTO_MAPPING_KEY = MAPPING_KEY.anikoto;

export const LIBERTY_EPISODES_KEY = (localAnimeId: string) =>
  `aniliberty:episodes:${localAnimeId.trim()}`;

export const LIBERTY_EPISODES_TTL_MS = 45 * 60 * 1000;

export function getMappingCacheKey(
  localAnimeId: string,
  provider: WatchStreamProvider,
): string {
  if (provider === 'aniliberty') return MAPPING_KEY.aniliberty(localAnimeId);
  if (provider === 'hikka') return MAPPING_KEY.hikka(localAnimeId);
  return MAPPING_KEY.anikoto(localAnimeId);
}
