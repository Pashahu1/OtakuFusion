import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

export function clampActiveServerId(
  id: string | null,
  userChoseDub: boolean,
  watchStreamProvider: WatchStreamProvider,
  catalogHasDub: boolean,
  episodeHasDubForResolve: boolean | undefined,
): string | null {
  if (userChoseDub) return id;
  if (watchStreamProvider === 'aniliberty' || watchStreamProvider === 'hikka') {
    return id === '2' ? '1' : id;
  }
  if (!catalogHasDub && id === '2') return '1';
  if (watchStreamProvider === 'animepahe' && episodeHasDubForResolve === false && id === '2') {
    return '1';
  }
  return id;
}
