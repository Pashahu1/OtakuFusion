export type WatchStreamProvider = 'animepahe' | 'aniliberty';

export const STORAGE_WATCH_STREAM_PROVIDER = 'watch_stream_provider';

export function readWatchStreamProvider(): WatchStreamProvider {
  if (typeof window === 'undefined') return 'animepahe';
  const v = localStorage.getItem(STORAGE_WATCH_STREAM_PROVIDER)?.toLowerCase();
  if (v === 'anilibria' || v === 'aniliberty') return 'aniliberty';
  if (v === 'kai') {
    localStorage.setItem(STORAGE_WATCH_STREAM_PROVIDER, 'animepahe');
    return 'animepahe';
  }
  if (v === 'animepahe') return 'animepahe';
  return 'animepahe';
}

export function writeWatchStreamProvider(value: WatchStreamProvider): void {
  if (typeof window === 'undefined') return;
  try {
    const next = value === 'aniliberty' ? 'aniliberty' : 'animepahe';
    localStorage.setItem(STORAGE_WATCH_STREAM_PROVIDER, next);
  } catch {
    /* ignore */
  }
}
