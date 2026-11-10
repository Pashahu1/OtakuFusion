import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

export function resolveProviderAnimeId(
  watchStreamProvider: WatchStreamProvider,
  ids: {
    hikkaCatalogProviderId: string | null;
    anikotoCatalogProviderId: string | null;
  },
): string | null {
  if (watchStreamProvider === 'hikka') return ids.hikkaCatalogProviderId;
  if (watchStreamProvider === 'anikoto') return ids.anikotoCatalogProviderId;
  return null;
}
