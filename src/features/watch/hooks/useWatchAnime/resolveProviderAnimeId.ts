import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

export function resolveProviderAnimeId(
  watchStreamProvider: WatchStreamProvider,
  ids: {
    anilibertyCatalogProviderId: string | null;
    hikkaCatalogProviderId: string | null;
    anikotoCatalogProviderId: string | null;
  },
): string | null {
  if (watchStreamProvider === 'aniliberty') return ids.anilibertyCatalogProviderId;
  if (watchStreamProvider === 'hikka') return ids.hikkaCatalogProviderId;
  if (watchStreamProvider === 'anikoto') return ids.anikotoCatalogProviderId;
  return null;
}
