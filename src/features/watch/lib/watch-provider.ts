export type WatchStreamProvider = 'animepahe' | 'aniliberty' | 'hikka';

export const STORAGE_WATCH_STREAM_PROVIDER = 'watch_stream_provider';

const WATCH_STREAM_PROVIDERS = new Set<WatchStreamProvider>([
  'animepahe',
  'aniliberty',
  'hikka',
]);

export function normalizeWatchStreamProvider(
  value: string | null | undefined
): WatchStreamProvider {
  const v = value?.trim().toLowerCase() ?? '';
  if (v === 'anilibria' || v === 'aniliberty') return 'aniliberty';
  if (v === 'hikka') return 'hikka';
  if (v === 'animepahe') return 'animepahe';
  return 'animepahe';
}

export function readWatchStreamProvider(): WatchStreamProvider {
  if (typeof window === 'undefined') return 'animepahe';
  const stored = localStorage.getItem(STORAGE_WATCH_STREAM_PROVIDER);
  const next = normalizeWatchStreamProvider(stored);
  if (stored && !WATCH_STREAM_PROVIDERS.has(stored as WatchStreamProvider)) {
    try {
      localStorage.setItem(STORAGE_WATCH_STREAM_PROVIDER, next);
    } catch {
      // ignore
    }
  }
  return next;
}

export function writeWatchStreamProvider(value: WatchStreamProvider): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_WATCH_STREAM_PROVIDER, value);
  } catch {
    // ignore
  }
}
