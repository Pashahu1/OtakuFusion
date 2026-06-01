'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useFavoritesQuery } from '@/hooks/useFavorites';
import { buildProfileDashboardData } from '../lib/profile-stats';
import {
  countWatchedEpisodesInStorage,
  readWatchActivityLog,
  type WatchActivityEntry,
} from '../lib/watch-activity-log';

export function useProfileDashboard(enabled: boolean) {
  const { data: favorites = [] } = useFavoritesQuery(enabled);
  const [activity, setActivity] = useState<WatchActivityEntry[]>([]);
  const [watchedFromStorage, setWatchedFromStorage] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setActivity(readWatchActivityLog());
    setWatchedFromStorage(countWatchedEpisodesInStorage());
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    setHydrated(true);
    const onUpdate = () => refresh();
    window.addEventListener('watchActivityUpdated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('watchActivityUpdated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, [enabled, refresh]);

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
