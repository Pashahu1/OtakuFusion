export type WatchStreamProvider = 'animepahe' | 'aniliberty' | 'hikka';

export const STORAGE_WATCH_STREAM_PROVIDER = 'watch_stream_provider';

const LEGACY_STREAM_PROVIDERS = new Set(['animex', 'anicore', 'kai']);

export function normalizeWatchStreamProvider(
  value: string | null | undefined
): WatchStreamProvider {
  const v = value?.trim().toLowerCase() ?? '';
  if (v === 'anilibria' || v === 'aniliberty') return 'aniliberty';
  if (v === 'hikka' || v === 'ukrainian' || v === 'uk') return 'hikka';
  if (v === 'animepahe' || LEGACY_STREAM_PROVIDERS.has(v)) return 'animepahe';
  return 'animepahe';
}

export function readWatchStreamProvider(): WatchStreamProvider {
  if (typeof window === 'undefined') return 'animepahe';
  const stored = localStorage.getItem(STORAGE_WATCH_STREAM_PROVIDER);
  const next = normalizeWatchStreamProvider(stored);
  if (stored && (LEGACY_STREAM_PROVIDERS.has(stored.trim().toLowerCase()) || stored === 'anicore')) {
    try {
      localStorage.setItem(STORAGE_WATCH_STREAM_PROVIDER, next);
    } catch {

    }
  }
  return next;
}

export function writeWatchStreamProvider(value: WatchStreamProvider): void {
  if (typeof window === 'undefined') return;
  try {
    const next =
      value === 'aniliberty' ? 'aniliberty' : value === 'hikka' ? 'hikka' : 'animepahe';
    localStorage.setItem(STORAGE_WATCH_STREAM_PROVIDER, next);
  } catch {

  }
}
