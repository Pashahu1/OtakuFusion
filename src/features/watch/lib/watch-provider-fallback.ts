import type { WatchStreamProvider } from './watch-provider';

export const WATCH_PROVIDER_FALLBACK_ORDER: readonly WatchStreamProvider[] = [
  'hikka',
] as const;

export function nextWatchStreamProvider(
  _current: WatchStreamProvider,
): WatchStreamProvider | null {
  return null;
}

export function nextEligibleWatchPlaybackProvider(_input: {
  current: WatchStreamProvider;
  hikkaLanguageMenuEligible: boolean;
}): WatchStreamProvider | null {
  return null;
}

export function isCatalogFailureError(
  error: string,
  provider: WatchStreamProvider,
): boolean {
  const key = error.toLowerCase();
  if (provider !== 'hikka') return false;
  return (
    key.includes('hikka_catalog_not_found') ||
    key.includes('hikka_watch_not_found') ||
    key.includes('hikka_features_forbidden') ||
    key.includes('hikka_catalog') ||
    key.includes('hikka_features')
  );
}
