export type WatchStreamProvider = 'aniliberty' | 'hikka' | 'anikoto';

/** Primary catalog/stream provider — loads first; others prefetch in background. */
export const DEFAULT_WATCH_STREAM_PROVIDER: WatchStreamProvider = 'anikoto';

export function normalizeWatchStreamProvider(
  value: string | null | undefined
): WatchStreamProvider {
  const v = value?.trim().toLowerCase() ?? '';
  if (v === 'anilibria' || v === 'aniliberty') return 'aniliberty';
  if (v === 'hikka') return 'hikka';
  if (v === 'anikoto') return 'anikoto';
  return DEFAULT_WATCH_STREAM_PROVIDER;
}
