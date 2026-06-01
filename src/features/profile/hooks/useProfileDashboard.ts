'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { useFavoritesQuery } from '@/hooks/useFavorites';
import { buildProfileDashboardData } from '../lib/profile-stats';
import {
  EMPTY_WATCH_ACTIVITY,
  getStableWatchActivitySnapshot,
} from '../lib/watch-activity-snapshot';
import { countWatchedEpisodesInStorage } from '../lib/watch-activity-log';

function subscribeWatchActivity(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('watchActivityUpdated', onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener('watchActivityUpdated', onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
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
    if (!enabled) return EMPTY_WATCH_ACTIVITY;
    return getStableWatchActivitySnapshot();
  }, [enabled]);

  const getWatchedCountSnapshot = useCallback(() => {
    if (!enabled) return 0;
    return readWatchedCountSnapshot();
  }, [enabled]);

  const activity = useSyncExternalStore(
    subscribeActivity,
    getActivitySnapshot,
    () => EMPTY_WATCH_ACTIVITY,
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
