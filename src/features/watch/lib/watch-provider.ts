export type WatchStreamProvider = 'anicore' | 'aniliberty' | 'hikka';

export const STORAGE_WATCH_STREAM_PROVIDER = 'watch_stream_provider';

export function readWatchStreamProvider(): WatchStreamProvider {
  if (typeof window === 'undefined') return 'anicore';
  const v = localStorage.getItem(STORAGE_WATCH_STREAM_PROVIDER)?.toLowerCase();
  if (v === 'anilibria' || v === 'aniliberty') return 'aniliberty';
  if (v === 'hikka' || v === 'ukrainian' || v === 'uk') return 'hikka';
  if (v === 'anicore') return 'anicore';
  if (v === 'animex' || v === 'animepahe' || v === 'kai') {
    localStorage.setItem(STORAGE_WATCH_STREAM_PROVIDER, 'anicore');
    return 'anicore';
  }
  return 'anicore';
}

export function writeWatchStreamProvider(value: WatchStreamProvider): void {
  if (typeof window === 'undefined') return;
  try {
    const next =
      value === 'aniliberty' ? 'aniliberty' : value === 'hikka' ? 'hikka' : 'anicore';
    localStorage.setItem(STORAGE_WATCH_STREAM_PROVIDER, next);
  } catch {

  }
}
