import { useEffect, useRef } from 'react';

import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import { isWatchDubServerId, WATCH_SERVER_SUB_ID } from '@/shared/data/servers';

interface UseWatchAnikotoDubUnavailableFallbackInput {
  watchStreamProvider: WatchStreamProvider;
  activeServerId: string | null;
  streamErrorCode: string | null;
  setActiveServerIdRaw: (id: string | null) => void;
}

/** When Anikoto dub is unavailable, fall back to sub and re-resolve. */
export function useWatchAnikotoDubUnavailableFallback({
  watchStreamProvider,
  activeServerId,
  streamErrorCode,
  setActiveServerIdRaw,
}: UseWatchAnikotoDubUnavailableFallbackInput): void {
  const issuedRef = useRef<string | null>(null);

  useEffect(() => {
    issuedRef.current = null;
  }, [watchStreamProvider, activeServerId]);

  useEffect(() => {
    if (watchStreamProvider !== 'anikoto') return;
    if (!isWatchDubServerId(activeServerId)) return;

    const code = streamErrorCode?.trim().toLowerCase() ?? '';
    if (!code.includes('dub_not_available')) return;

    const token = `${watchStreamProvider}:${activeServerId}:${code}`;
    if (issuedRef.current === token) return;
    issuedRef.current = token;

    setActiveServerIdRaw(WATCH_SERVER_SUB_ID);
  }, [
    watchStreamProvider,
    activeServerId,
    streamErrorCode,
    setActiveServerIdRaw,
  ]);
}
