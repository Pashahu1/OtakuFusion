'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { useFavoritesQuery } from '@/hooks/useFavorites';
import { buildProfileDashboardData } from '../lib/profile-stats';
import {
  countWatchedEpisodesInStorage,
  readWatchActivityLog,
  type WatchActivityEntry,
} from '../lib/watch-activity-log';

function subscribeWatchActivity(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('watchActivityUpdated', onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener('watchActivityUpdated', onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

const EMPTY_ACTIVITY: WatchActivityEntry[] = [];

let cachedActivitySnapshot: WatchActivityEntry[] = EMPTY_ACTIVITY;
let cachedActivitySnapshotKey = '';

function readActivitySnapshot(): WatchActivityEntry[] {
  if (typeof window === 'undefined') return EMPTY_ACTIVITY;

  const next = readWatchActivityLog();
  const snapshotKey = JSON.stringify(next);
  if (snapshotKey === cachedActivitySnapshotKey) {
    return cachedActivitySnapshot;
  }

  cachedActivitySnapshotKey = snapshotKey;
  cachedActivitySnapshot = next;
  return cachedActivitySnapshot;
}

function readWatchedCountSnapshot(): number {
  if (typeof window === 'undefined') return 0;
  return countWatchedEpisodesInStorage();
}

export function useProfileDashboard(enabled: boolean) {
  const { data: favorites = [] } = useFavoritesQuery(enabled);

  const subscribeActivity = useCallback(
    (onStoreChange: () => void) => {
      if (!enabled) return () => {};
      return subscribeWatchActivity(onStoreChange);
    },
    [enabled],
  );

  const getActivitySnapshot = useCallback(() => {
    if (!enabled) return EMPTY_ACTIVITY;
    return readActivitySnapshot();
  }, [enabled]);

  const getWatchedCountSnapshot = useCallback(() => {
    if (!enabled) return 0;
    return readWatchedCountSnapshot();
  }, [enabled]);

  const activity = useSyncExternalStore(
    subscribeActivity,
    getActivitySnapshot,
    () => EMPTY_ACTIVITY,
  );

  const watchedFromStorage = useSyncExternalStore(
    subscribeActivity,
    getWatchedCountSnapshot,
    () => 0,
  );

  const hydrated = useSyncExternalStore(
    () => () => {},
    () => enabled,
    () => false,
  );

  const dashboard = useMemo(
    () =>
      buildProfileDashboardData(
        activity,
        favorites.length,
        watchedFromStorage,
      ),
    [activity, favorites.length, watchedFromStorage],
  );

  return { dashboard, hydrated };
}
