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

function snapshotsEqual(
  a: ContinueWatchingEpisodeProgress | null,
  b: ContinueWatchingEpisodeProgress | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.episodeKey === b.episodeKey && a.progressRatio === b.progressRatio;
}

/** React requires getSnapshot to return a stable reference when data is unchanged. */
const snapshotCache = new Map<
  string,
  ContinueWatchingEpisodeProgress | null
>();

function getCachedSnapshot(animeId: string): ContinueWatchingEpisodeProgress | null {
  const next = readContinueWatchingEpisodeProgress(animeId);
  const cached = snapshotCache.get(animeId);

  if (snapshotsEqual(cached ?? null, next)) {
    return cached ?? null;
  }

  snapshotCache.set(animeId, next);
  return next;
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
  const getSnapshot = useCallback(() => getCachedSnapshot(animeId), [animeId]);

  return useSyncExternalStore(
    subscribeContinueWatching,
    getSnapshot,
    () => null,
  );
}
