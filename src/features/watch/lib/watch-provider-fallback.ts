import {
  isWatchStreamProviderEnabled,
  type WatchStreamProvider,
} from './watch-provider';

/**
 * Independent providers, in playback fallback order.
 * Anikoto crash must not block Hikka (UKR).
 */
export const WATCH_PROVIDER_FALLBACK_ORDER: readonly WatchStreamProvider[] = [
  'anikoto',
  'hikka',
] as const;

export function nextWatchStreamProvider(
  current: WatchStreamProvider,
): WatchStreamProvider | null {
  const idx = WATCH_PROVIDER_FALLBACK_ORDER.indexOf(current);
  if (idx < 0) return null;
  for (let i = idx + 1; i < WATCH_PROVIDER_FALLBACK_ORDER.length; i++) {
    const next = WATCH_PROVIDER_FALLBACK_ORDER[i]!;
    if (isWatchStreamProviderEnabled(next)) return next;
  }
  return null;
}

export function nextEligibleWatchPlaybackProvider(input: {
  current: WatchStreamProvider;
  hikkaLanguageMenuEligible: boolean;
}): WatchStreamProvider | null {
  let next = nextWatchStreamProvider(input.current);
  while (next) {
    if (next === 'hikka' && input.hikkaLanguageMenuEligible) return next;
    next = nextWatchStreamProvider(next);
  }
  return null;
}

export function isCatalogFailureError(
  error: string,
  provider: WatchStreamProvider,
): boolean {
  const key = error.toLowerCase();
  if (provider === 'hikka') {
    return (
      key.includes('hikka_catalog_not_found') ||
      key.includes('hikka_watch_not_found') ||
      key.includes('hikka_features_forbidden') ||
      key.includes('hikka_catalog') ||
      key.includes('hikka_features')
    );
  }
  if (provider === 'anikoto') {
    return (
      key.includes('anikoto_catalog_not_found') ||
      key.includes('anikoto_catalog') ||
      key.includes('anikoto_episodes') ||
      key.includes('anikoto_stream')
    );
  }
  return false;
}
