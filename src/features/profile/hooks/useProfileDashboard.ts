'use client';

import { useMemo, useSyncExternalStore } from 'react';

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

function readActivitySnapshot(): WatchActivityEntry[] {
  if (typeof window === 'undefined') return [];
  return readWatchActivityLog();
}

function readWatchedCountSnapshot(): number {
  if (typeof window === 'undefined') return 0;
  return countWatchedEpisodesInStorage();
}

export function useProfileDashboard(enabled: boolean) {
  const { data: favorites = [] } = useFavoritesQuery(enabled);

  const activity = useSyncExternalStore(
    enabled ? subscribeWatchActivity : () => () => {},
    enabled ? readActivitySnapshot : () => [],
    () => [],
  );

  const watchedFromStorage = useSyncExternalStore(
    enabled ? subscribeWatchActivity : () => () => {},
    enabled ? readWatchedCountSnapshot : () => 0,
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
