export type WatchStreamProvider = 'animepahe' | 'aniliberty' | 'hikka';

export function normalizeWatchStreamProvider(
  value: string | null | undefined
): WatchStreamProvider {
  const v = value?.trim().toLowerCase() ?? '';
  if (v === 'anilibria' || v === 'aniliberty') return 'aniliberty';
  if (v === 'hikka') return 'hikka';
  if (v === 'animepahe') return 'animepahe';
  return 'animepahe';
}
