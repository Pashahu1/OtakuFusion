import { useCallback } from 'react';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { WarmAlternateCatalogEntry } from './types';

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
  setHikkaLanguageMenuEligible: (v: boolean) => void;
}

/** Opposite-provider prefetch retired — Hikka is the only stream. */
export function useWatchAnimeDeferredPrefetch(
  _params: UseWatchAnimeDeferredPrefetchParams,
): () => void {
  return useCallback(() => {
    /* no-op */
  }, []);
}
