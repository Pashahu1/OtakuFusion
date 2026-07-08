import {
  WATCH_SERVER_DUB_ID,
  WATCH_SERVER_SUB_ID,
} from '@/shared/data/servers';
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
    return id === WATCH_SERVER_DUB_ID ? WATCH_SERVER_SUB_ID : id;
  }
  if (watchStreamProvider === 'anikoto') {
    if (!catalogHasDub && id === WATCH_SERVER_DUB_ID) return WATCH_SERVER_SUB_ID;
    if (episodeHasDubForResolve === false && id === WATCH_SERVER_DUB_ID) {
      return WATCH_SERVER_SUB_ID;
    }
    return id;
  }
  return id;
}
