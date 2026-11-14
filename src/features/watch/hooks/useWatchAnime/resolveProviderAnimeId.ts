import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

export function resolveProviderAnimeId(
  _watchStreamProvider: WatchStreamProvider,
  ids: {
    hikkaCatalogProviderId: string | null;
  },
): string | null {
  return ids.hikkaCatalogProviderId;
}
