import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { UseWatchStreamReturn } from './useWatchStream';

interface UseWatchDubFallbackInput {
  watchStreamProvider: WatchStreamProvider;
  activeServerId: string | null;
  resolverLang: 'sub' | 'dub';
  userChoseDubRef: MutableRefObject<boolean>;
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

export function useWatchDubFallback({
  watchStreamProvider,
  activeServerId,
  resolverLang,
  userChoseDubRef,
  setActiveServerIdRaw,
  stream,
  resetKey,
}: UseWatchDubFallbackInput): boolean {
  const [streamHardExhausted, setStreamHardExhausted] = useState(false);
  const issuedDubToSubFallbackRef = useRef(false);

  useEffect(() => {
    issuedDubToSubFallbackRef.current = false;
    userChoseDubRef.current = false;
    setStreamHardExhausted(false);
  }, [resetKey, userChoseDubRef]);

  useEffect(() => {
    if (!stream.resolveAttempted || stream.buffering) return;
    if (stream.streamUrl) return;
    if (!stream.errorCode) return;
    if (watchStreamProvider !== 'animepahe') return;
    if (activeServerId !== '2' || resolverLang !== 'dub') return;
    if (!isAutoDubFallbackError(stream.errorCode)) return;
    if (userChoseDubRef.current) return;

    issuedDubToSubFallbackRef.current = true;
    setActiveServerIdRaw('1');
  }, [
    stream.resolveAttempted,
    stream.buffering,
    stream.streamUrl,
    stream.errorCode,
    watchStreamProvider,
    activeServerId,
    resolverLang,
    userChoseDubRef,
    setActiveServerIdRaw,
  ]);

  useEffect(() => {
    if (!stream.streamUrl) return;
    issuedDubToSubFallbackRef.current = false;
    setStreamHardExhausted(false);
  }, [stream.streamUrl]);

  useEffect(() => {
    if (!issuedDubToSubFallbackRef.current) return;
    if (!stream.resolveAttempted || stream.buffering || stream.streamUrl) return;
    if (watchStreamProvider !== 'animepahe') return;
    if (activeServerId !== '1' || resolverLang !== 'sub') return;
    if (!stream.errorCode) return;

    setStreamHardExhausted(true);
  }, [
    stream.resolveAttempted,
    stream.buffering,
    stream.streamUrl,
    stream.errorCode,
    watchStreamProvider,
    activeServerId,
    resolverLang,
  ]);

  return streamHardExhausted;
}
