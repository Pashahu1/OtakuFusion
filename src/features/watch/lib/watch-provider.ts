export type WatchStreamProvider = 'hikka';

export const DEFAULT_WATCH_STREAM_PROVIDER: WatchStreamProvider = 'hikka';

export function isWatchStreamProviderEnabled(
  provider: string,
): boolean {
  return provider === 'hikka';
}

/** Saved Anikoto (and other) prefs remap to Hikka. */
export function normalizeWatchStreamProvider(
  value: string | null | undefined,
): WatchStreamProvider {
  void value;
  return 'hikka';
}
