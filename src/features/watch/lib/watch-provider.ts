export type WatchStreamProvider = 'hikka' | 'anikoto';

/**
 * Flip to `true` when Anikoto `/api/stream` returns a live `m3u8` again.
 * While false, Japanese/English stay out of the player.
 */
export const ANIKOTO_PLAYBACK_ENABLED = false;

/** Primary catalog/stream provider — loads first; others prefetch in background. */
export const DEFAULT_WATCH_STREAM_PROVIDER: WatchStreamProvider =
  ANIKOTO_PLAYBACK_ENABLED ? 'anikoto' : 'hikka';

export function isWatchStreamProviderEnabled(
  provider: WatchStreamProvider,
): boolean {
  if (provider === 'anikoto') return ANIKOTO_PLAYBACK_ENABLED;
  return true;
}

export function normalizeWatchStreamProvider(
  value: string | null | undefined
): WatchStreamProvider {
  const v = value?.trim().toLowerCase() ?? '';
  if (v === 'hikka') return 'hikka';
  if (v === 'anikoto') {
    return isWatchStreamProviderEnabled('anikoto')
      ? 'anikoto'
      : DEFAULT_WATCH_STREAM_PROVIDER;
  }
  return DEFAULT_WATCH_STREAM_PROVIDER;
}
