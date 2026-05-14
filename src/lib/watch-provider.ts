export type WatchStreamProvider = 'animepahe';

export const STORAGE_WATCH_STREAM_PROVIDER = 'watch_stream_provider';

export function readWatchStreamProvider(): WatchStreamProvider {
  if (typeof window === 'undefined') return 'animepahe';
  const v = localStorage.getItem(STORAGE_WATCH_STREAM_PROVIDER)?.toLowerCase();
  if (v === 'anilibria' || v === 'aniliberty' || v === 'kai') {
    localStorage.setItem(STORAGE_WATCH_STREAM_PROVIDER, 'animepahe');
    return 'animepahe';
  }
  return 'animepahe';
}

export function writeWatchStreamProvider(_value: WatchStreamProvider): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_WATCH_STREAM_PROVIDER, 'animepahe');
  } catch {
    /* ignore */
  }
}
