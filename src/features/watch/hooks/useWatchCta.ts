'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';
import {
  resolveWatchCtaModel,
  type EpisodeRef,
  type WatchCtaModel,
} from '@/features/watch/lib/resolve-continue-watching-cta';
import { readContinueWatchingList } from '@/features/watch/lib/continue-watching-list';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface UseWatchCtaParams {
  animeId: string;
  dataId?: number;
  urlEp?: string;
  episodes: EpisodeRef[] | null;
}

export function useWatchCta({
  animeId,
  dataId,
  urlEp,
  episodes,
}: UseWatchCtaParams): WatchCtaModel {
  const [continueList, setContinueList] = useState<ContinueWatchingEntry[]>([]);
  const [watched] = useLocalStorage<Record<string, boolean>>(`watched-${animeId}`, {});

  const refreshContinueList = useCallback(() => {
    setContinueList(readContinueWatchingList());
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) refreshContinueList();
    });
    window.addEventListener('continueWatchingUpdated', refreshContinueList);
    return () => {
      cancelled = true;
      window.removeEventListener('continueWatchingUpdated', refreshContinueList);
    };
  }, [refreshContinueList]);

  return useMemo(
    () =>
      resolveWatchCtaModel({
        animeId,
        dataId,
        urlEp,
        continueList,
        watched,
        episodes,
      }),
    [animeId, continueList, dataId, episodes, urlEp, watched],
  );
}
