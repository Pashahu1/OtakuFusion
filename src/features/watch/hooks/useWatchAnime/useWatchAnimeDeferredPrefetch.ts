import { useCallback } from 'react';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import {
  prefetchAnilibertyMapping,
  prefetchAnicoreMapping,
  prefetchHikkaMapping,
} from './watchAnimePrefetch';

export interface UseWatchAnimeDeferredPrefetchParams {
  animeId: string;
  deferredOppositePrefetchRef: React.MutableRefObject<{
    animeId: string;
    data: AnimeData;
    provider: WatchStreamProvider;
  } | null>;
  oppositePrefetchDoneRef: React.MutableRefObject<string | null>;
  oppositePrefetchAbortRef: React.MutableRefObject<AbortController | null>;
  setAnicoreCatalogProviderId: (id: string) => void;
  setAnilibertyLanguageMenuEligible: (v: boolean) => void;
  setHikkaLanguageMenuEligible: (v: boolean) => void;
}

export function useWatchAnimeDeferredPrefetch(
  params: UseWatchAnimeDeferredPrefetchParams
): () => void {
  const {
    animeId,
    deferredOppositePrefetchRef,
    oppositePrefetchDoneRef,
    oppositePrefetchAbortRef,
    setAnicoreCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
  } = params;

  return useCallback(() => {
    const pending = deferredOppositePrefetchRef.current;
    if (!pending || pending.animeId !== animeId) return;
    if (oppositePrefetchDoneRef.current === animeId) return;
    oppositePrefetchDoneRef.current = animeId;

    oppositePrefetchAbortRef.current?.abort();
    const controller = new AbortController();
    oppositePrefetchAbortRef.current = controller;
    const { signal } = controller;
    const isCancelled = () => oppositePrefetchAbortRef.current !== controller;

    if (pending.provider === 'anicore') {
      prefetchAnilibertyMapping(
        pending.data,
        animeId,
        signal,
        () => isCancelled() || signal.aborted,
        () => {
          if (!isCancelled() && !signal.aborted) {
            setAnilibertyLanguageMenuEligible(true);
          }
        }
      );
      prefetchHikkaMapping(
        pending.data,
        animeId,
        signal,
        () => isCancelled() || signal.aborted,
        () => {
          if (!isCancelled() && !signal.aborted) {
            setHikkaLanguageMenuEligible(true);
          }
        }
      );
      return;
    }

    if (pending.provider === 'hikka') {
      prefetchAnicoreMapping(
        pending.data,
        animeId,
        signal,
        () => isCancelled() || signal.aborted,
        (anicoreId) => {
          if (!isCancelled() && !signal.aborted) {
            setAnicoreCatalogProviderId(anicoreId);
          }
        }
      );
      prefetchAnilibertyMapping(
        pending.data,
        animeId,
        signal,
        () => isCancelled() || signal.aborted,
        () => {
          if (!isCancelled() && !signal.aborted) {
            setAnilibertyLanguageMenuEligible(true);
          }
        }
      );
      return;
    }

    prefetchAnicoreMapping(
      pending.data,
      animeId,
      signal,
      () => isCancelled() || signal.aborted,
      (anicoreId) => {
        if (!isCancelled() && !signal.aborted) {
          setAnicoreCatalogProviderId(anicoreId);
        }
      }
    );
    prefetchHikkaMapping(
      pending.data,
      animeId,
      signal,
      () => isCancelled() || signal.aborted,
      () => {
        if (!isCancelled() && !signal.aborted) {
          setHikkaLanguageMenuEligible(true);
        }
      }
    );
  }, [
    animeId,
    deferredOppositePrefetchRef,
    oppositePrefetchAbortRef,
    oppositePrefetchDoneRef,
    setAnicoreCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
  ]);
}
