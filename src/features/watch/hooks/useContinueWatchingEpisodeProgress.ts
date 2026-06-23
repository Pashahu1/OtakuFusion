'use client';

import { useCallback, useSyncExternalStore } from 'react';

import {
  continueWatchingEpisodeParam,
  continueWatchingProgressRatio,
} from '@/features/watch/lib/continue-watching-display';
import { readContinueWatchingList } from '@/features/watch/lib/continue-watching-list';
import { findContinueWatchingEntry } from '@/features/watch/lib/resolve-continue-watching-cta';

export interface ContinueWatchingEpisodeProgress {
  episodeKey: string;
  progressRatio: number;
}

function readContinueWatchingEpisodeProgress(
  animeId: string,
): ContinueWatchingEpisodeProgress | null {
  if (!animeId.trim()) return null;

  const entry = findContinueWatchingEntry(readContinueWatchingList(), animeId);
  if (!entry) return null;

  const progressRatio = continueWatchingProgressRatio(
    entry.positionSeconds,
    entry.durationSeconds,
  );
  if (progressRatio <= 0) return null;

  return {
    episodeKey: continueWatchingEpisodeParam(entry),
    progressRatio,
  };
}

function subscribeContinueWatching(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('continueWatchingUpdated', onStoreChange);
  return () => {
    window.removeEventListener('continueWatchingUpdated', onStoreChange);
  };
}

export function useContinueWatchingEpisodeProgress(
  animeId: string,
): ContinueWatchingEpisodeProgress | null {
  const getSnapshot = useCallback(
    () => readContinueWatchingEpisodeProgress(animeId),
    [animeId],
  );

  return useSyncExternalStore(
    subscribeContinueWatching,
    getSnapshot,
    () => null,
  );
}
