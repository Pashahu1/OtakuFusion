import type { WatchStreamProvider } from './watch-provider';

/** Catalog / playback fallback when the active provider has no source. */
export const WATCH_PROVIDER_FALLBACK_ORDER: readonly WatchStreamProvider[] = [
  'hikka',
  'aniliberty',
] as const;

export function nextWatchStreamProvider(
  current: WatchStreamProvider,
): WatchStreamProvider | null {
  const idx = WATCH_PROVIDER_FALLBACK_ORDER.indexOf(current);
  if (idx < 0 || idx >= WATCH_PROVIDER_FALLBACK_ORDER.length - 1) return null;
  return WATCH_PROVIDER_FALLBACK_ORDER[idx + 1]!;
}

export function priorWatchStreamProvider(
  current: WatchStreamProvider,
): WatchStreamProvider | null {
  const idx = WATCH_PROVIDER_FALLBACK_ORDER.indexOf(current);
  if (idx <= 0) return null;
  return WATCH_PROVIDER_FALLBACK_ORDER[idx - 1]!;
}

export function catalogErrorBelongsToProvider(
  error: string,
  provider: WatchStreamProvider,
): boolean {
  const key = error.toLowerCase();
  if (provider === 'animepahe') {
    return key.includes('animepahe');
  }
  if (provider === 'hikka') {
    return key.includes('hikka');
  }
  if (provider === 'aniliberty') {
    return key.includes('aniliberty') || key.includes('anilibria');
  }
  return false;
}

export function isCatalogFailureError(
  error: string,
  provider: WatchStreamProvider,
): boolean {
  const key = error.toLowerCase();
  if (provider === 'animepahe') {
    return (
      key.includes('animepahe_catalog_not_found') ||
      key.includes('animepahe_catalog') ||
      key.includes('animepahe_episodes') ||
      key.includes('animepahe_no_search')
    );
  }
  if (provider === 'hikka') {
    return (
      key.includes('hikka_catalog_not_found') ||
      key.includes('hikka_watch_not_found') ||
      key.includes('hikka_features_forbidden') ||
      key.includes('hikka_catalog') ||
      key.includes('hikka_features')
    );
  }
  if (provider === 'aniliberty') {
    return (
      key.includes('aniliberty_catalog_not_found') ||
      key.includes('aniliberty_episode_count_mismatch') ||
      key.includes('aniliberty_catalog') ||
      key.includes('aniliberty_episodes')
    );
  }
  return false;
}
