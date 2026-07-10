import { isWatchDubServerId } from '@/shared/data/servers';
import type { WatchStreamProvider } from '@/lib/watch-provider';

/** Menu highlight for Anikoto — prefer resolved stream lang over stale selection. */
export function resolveLanguageMenuAnikotoLang(input: {
  watchStreamProvider: WatchStreamProvider;
  activeServerId: string | null;
  resolvedStreamLang?: 'sub' | 'dub' | null;
}): 'sub' | 'dub' | null {
  const { watchStreamProvider, activeServerId, resolvedStreamLang } = input;
  if (watchStreamProvider !== 'anikoto') return null;
  if (resolvedStreamLang === 'sub' || resolvedStreamLang === 'dub') {
    return resolvedStreamLang;
  }
  return isWatchDubServerId(activeServerId) ? 'dub' : 'sub';
}
