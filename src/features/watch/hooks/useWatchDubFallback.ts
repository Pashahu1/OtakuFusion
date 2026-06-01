import { useEffect, useState } from 'react';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { UseWatchStreamReturn } from './useWatchStream';

interface UseWatchDubFallbackInput {
  watchStreamProvider: WatchStreamProvider;
  activeServerId: string | null;
  resolverLang: 'sub' | 'dub';
  userChoseDub: boolean;
  setActiveServerIdRaw: (id: string | null) => void;
  stream: Pick<
    UseWatchStreamReturn,
    'resolveAttempted' | 'buffering' | 'streamUrl' | 'errorCode'
  >;
  resetKey: string;
}

const NON_FALLBACK_ERROR_FRAGMENTS = [
  'episode_not_found',
  'animepahe_sources_empty',
  'episode is required',
  'lang must',
  'watch_resolve_invalid_json',
  'watch_resolve_empty',
] as const;

function isAutoDubFallbackError(errorCode: string): boolean {
  const code = errorCode.toLowerCase();
  return !NON_FALLBACK_ERROR_FRAGMENTS.some((fragment) => code.includes(fragment));
}

interface DubFallbackState {
  resetKey: string;
  issuedFallback: boolean;
}

export function useWatchDubFallback({
  watchStreamProvider,
  activeServerId,
  resolverLang,
  userChoseDub,
  setActiveServerIdRaw,
  stream,
  resetKey,
}: UseWatchDubFallbackInput): boolean {
  const [fallbackState, setFallbackState] = useState<DubFallbackState>({
    resetKey,
    issuedFallback: false,
  });

  if (fallbackState.resetKey !== resetKey) {
    setFallbackState({ resetKey, issuedFallback: false });
  }

  if (stream.streamUrl && fallbackState.issuedFallback) {
    setFallbackState((prev) => ({ ...prev, issuedFallback: false }));
  }

  const canIssueFallback =
    stream.resolveAttempted &&
    !stream.buffering &&
    !stream.streamUrl &&
    Boolean(stream.errorCode) &&
    watchStreamProvider === 'animepahe' &&
    activeServerId === '2' &&
    resolverLang === 'dub' &&
    isAutoDubFallbackError(stream.errorCode ?? '') &&
    !userChoseDub &&
    !fallbackState.issuedFallback;

  if (canIssueFallback) {
    setFallbackState((prev) => ({ ...prev, issuedFallback: true }));
  }

  useEffect(() => {
    if (!fallbackState.issuedFallback) return;
    if (activeServerId !== '2') return;
    setActiveServerIdRaw('1');
  }, [fallbackState.issuedFallback, activeServerId, setActiveServerIdRaw]);

  return (
    fallbackState.issuedFallback &&
    stream.resolveAttempted &&
    !stream.buffering &&
    !stream.streamUrl &&
    watchStreamProvider === 'animepahe' &&
    activeServerId === '1' &&
    resolverLang === 'sub' &&
    Boolean(stream.errorCode)
  );
}
