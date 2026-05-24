export type WatchStreamProvider = 'anicore' | 'aniliberty' | 'hikka';

export const STORAGE_WATCH_STREAM_PROVIDER = 'watch_stream_provider';

const LEGACY_STREAM_PROVIDERS = new Set(['animex', 'animepahe', 'kai']);

export function normalizeWatchStreamProvider(
  value: string | null | undefined
): WatchStreamProvider {
  const v = value?.trim().toLowerCase() ?? '';
  if (v === 'anilibria' || v === 'aniliberty') return 'aniliberty';
  if (v === 'hikka' || v === 'ukrainian' || v === 'uk') return 'hikka';
  if (v === 'anicore' || LEGACY_STREAM_PROVIDERS.has(v)) return 'anicore';
  return 'anicore';
}

export function readWatchStreamProvider(): WatchStreamProvider {
  if (typeof window === 'undefined') return 'anicore';
  const stored = localStorage.getItem(STORAGE_WATCH_STREAM_PROVIDER);
  const next = normalizeWatchStreamProvider(stored);
  if (stored && LEGACY_STREAM_PROVIDERS.has(stored.trim().toLowerCase())) {
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
      value === 'aniliberty' ? 'aniliberty' : value === 'hikka' ? 'hikka' : 'anicore';
    localStorage.setItem(STORAGE_WATCH_STREAM_PROVIDER, next);
  } catch {

  }
}
