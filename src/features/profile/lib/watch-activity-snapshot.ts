import { readWatchActivityLog, type WatchActivityEntry } from './watch-activity-log';

export const EMPTY_WATCH_ACTIVITY: WatchActivityEntry[] = [];

let cachedSnapshot: WatchActivityEntry[] = EMPTY_WATCH_ACTIVITY;
let cachedSnapshotKey = '';

/** Stable array ref for `useSyncExternalStore` when localStorage log is unchanged. */
export function getStableWatchActivitySnapshot(): WatchActivityEntry[] {
  if (typeof window === 'undefined') return EMPTY_WATCH_ACTIVITY;

  const next = readWatchActivityLog();
  const snapshotKey = JSON.stringify(next);
  if (snapshotKey === cachedSnapshotKey) {
    return cachedSnapshot;
  }

  cachedSnapshotKey = snapshotKey;
  cachedSnapshot = next;
  return cachedSnapshot;
}

export function resetWatchActivitySnapshotCache(): void {
  cachedSnapshot = EMPTY_WATCH_ACTIVITY;
  cachedSnapshotKey = '';
}
