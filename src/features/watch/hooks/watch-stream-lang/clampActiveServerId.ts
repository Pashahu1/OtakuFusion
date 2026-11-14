import { WATCH_SERVER_DUB_ID, WATCH_SERVER_SUB_ID } from '@/shared/data/servers';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

export function clampActiveServerId(
  id: string | null,
  userChoseDub: boolean,
  _watchStreamProvider: WatchStreamProvider,
  _catalogHasDub: boolean,
  _episodeHasDubForResolve: boolean | undefined,
): string | null {
  if (userChoseDub) return id;
  return id === WATCH_SERVER_DUB_ID ? WATCH_SERVER_SUB_ID : id;
}
