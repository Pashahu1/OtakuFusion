import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

export function resolveProviderAnimeId(
  watchStreamProvider: WatchStreamProvider,
  ids: {
    animepaheCatalogProviderId: string | null;
    anilibertyCatalogProviderId: string | null;
    hikkaCatalogProviderId: string | null;
  },
): string | null {
  if (watchStreamProvider === 'aniliberty') return ids.anilibertyCatalogProviderId;
  if (watchStreamProvider === 'hikka') return ids.hikkaCatalogProviderId;
  return ids.animepaheCatalogProviderId;
}
