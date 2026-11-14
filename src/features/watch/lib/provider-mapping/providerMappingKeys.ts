import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

const MAPPING_KEY = {
  hikka: (localAnimeId: string) => `hikka:mapping:${localAnimeId}`,
} as const;

export function getMappingCacheKey(
  localAnimeId: string,
  _provider: WatchStreamProvider = 'hikka',
): string {
  return MAPPING_KEY.hikka(localAnimeId);
}
