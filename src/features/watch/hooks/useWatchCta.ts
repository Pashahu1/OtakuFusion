'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CONTINUE_WATCHING_STORAGE_KEY } from '@/features/player';
import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';
import {
  resolveWatchCtaModel,
  type EpisodeRef,
  type WatchCtaModel,
} from '@/features/watch/lib/resolve-continue-watching-cta';
import { useLocalStorage } from '@/hooks/useLocalStorage';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function parseContinueWatchingList(raw: string | null): ContinueWatchingEntry[] {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    const valid: ContinueWatchingEntry[] = [];
    for (const item of parsed) {
      if (!isRecord(item)) continue;

      const id = item.id;
      const episodeId = item.episodeId;
      if (
        typeof id !== 'string' ||
        id === '' ||
        typeof episodeId !== 'string' ||
        episodeId === ''
      ) {
        continue;
      }

      const rawDataId = item.data_id;
      const data_id =
        typeof rawDataId === 'number'
          ? rawDataId
          : typeof rawDataId === 'string'
            ? Number(rawDataId)
            : NaN;
      if (!Number.isFinite(data_id)) continue;

      valid.push({
        id,
        data_id,
        episodeId,
        episodeNum:
          typeof item.episodeNum === 'number' ? item.episodeNum : undefined,
      });
    }
    return valid;
  } catch {
    return [];
  }
}

function readContinueListFromStorage(): ContinueWatchingEntry[] {
  if (typeof window === 'undefined') return [];
  return parseContinueWatchingList(
    localStorage.getItem(CONTINUE_WATCHING_STORAGE_KEY)
  );
}

export interface UseWatchCtaParams {
  animeId: string;
  dataId?: number;
  urlEp?: string;
  episodes: EpisodeRef[] | null;
}

/** Hero / series CTA: play href + label from continueWatching + watched state. */
export function useWatchCta({
  animeId,
  dataId,
  urlEp,
  episodes,
}: UseWatchCtaParams): WatchCtaModel {
  const [continueList, setContinueList] = useState<ContinueWatchingEntry[]>([]);
  const [watched] = useLocalStorage<Record<string, boolean>>(
    `watched-${animeId}`,
    {}
  );

  const refreshContinueList = useCallback(() => {
    setContinueList(readContinueListFromStorage());
  }, []);

  useEffect(() => {
    refreshContinueList();
    window.addEventListener('continueWatchingUpdated', refreshContinueList);
    return () => {
      window.removeEventListener(
        'continueWatchingUpdated',
        refreshContinueList
      );
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
    [animeId, continueList, dataId, episodes, urlEp, watched]
  );
}
