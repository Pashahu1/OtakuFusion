export type WatchStreamProvider = 'kai' | 'anilibria';

export const STORAGE_WATCH_STREAM_PROVIDER = 'watch_stream_provider';

export function readWatchStreamProvider(): WatchStreamProvider {
  if (typeof window === 'undefined') return 'kai';
  const v = localStorage.getItem(STORAGE_WATCH_STREAM_PROVIDER)?.toLowerCase();
  if (v === 'anilibria' || v === 'aniliberty') return 'anilibria';
  return 'kai';
}

export function writeWatchStreamProvider(value: WatchStreamProvider): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_WATCH_STREAM_PROVIDER, value);
  } catch {
    /* ignore */
  }
}
