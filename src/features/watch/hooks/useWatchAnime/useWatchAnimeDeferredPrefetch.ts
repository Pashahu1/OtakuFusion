import { useCallback } from 'react';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { WarmAlternateCatalogEntry } from './types';
import {
  prefetchAnilibertyMapping,
  prefetchAnimepaheMapping,
  prefetchHikkaMapping,
} from './watchAnimePrefetch';

export interface UseWatchAnimeDeferredPrefetchParams {
  animeId: string;
  warmCatalogsRef: React.MutableRefObject<WarmAlternateCatalogEntry | null>;
  deferredOppositePrefetchRef: React.MutableRefObject<{
    animeId: string;
    data: AnimeData;
    provider: WatchStreamProvider;
  } | null>;
  oppositePrefetchDoneRef: React.MutableRefObject<string | null>;
  oppositePrefetchAbortRef: React.MutableRefObject<AbortController | null>;
  setAnimepaheCatalogProviderId: (id: string) => void;
  setAnilibertyLanguageMenuEligible: (v: boolean) => void;
  setHikkaLanguageMenuEligible: (v: boolean) => void;
}

export function useWatchAnimeDeferredPrefetch(
  params: UseWatchAnimeDeferredPrefetchParams
): () => void {
  const {
    animeId,
    warmCatalogsRef,
    deferredOppositePrefetchRef,
    oppositePrefetchDoneRef,
    oppositePrefetchAbortRef,
    setAnimepaheCatalogProviderId,
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

    if (pending.provider === 'animepahe') {
      prefetchAnilibertyMapping(
        pending.data,
        animeId,
        signal,
        () => isCancelled() || signal.aborted,
        () => {
          if (!isCancelled() && !signal.aborted) {
            setAnilibertyLanguageMenuEligible(true);
          }
        },
        undefined,
        warmCatalogsRef
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
        },
        undefined,
        warmCatalogsRef
      );
      return;
    }

    if (pending.provider === 'hikka') {
      prefetchAnimepaheMapping(
        pending.data,
        animeId,
        signal,
        () => isCancelled() || signal.aborted,
        (paheId) => {
          if (!isCancelled() && !signal.aborted) {
            setAnimepaheCatalogProviderId(paheId);
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
        },
        undefined,
        warmCatalogsRef
      );
      return;
    }

    prefetchAnimepaheMapping(
      pending.data,
      animeId,
      signal,
      () => isCancelled() || signal.aborted,
      (paheId) => {
        if (!isCancelled() && !signal.aborted) {
          setAnimepaheCatalogProviderId(paheId);
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
      },
      undefined,
      warmCatalogsRef
    );
  }, [
    animeId,
    warmCatalogsRef,
    deferredOppositePrefetchRef,
    oppositePrefetchAbortRef,
    oppositePrefetchDoneRef,
    setAnimepaheCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
  ]);
}
