import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getStableWatchActivitySnapshot,
  resetWatchActivitySnapshotCache,
} from './watch-activity-snapshot';
import { WATCH_ACTIVITY_STORAGE_KEY } from './watch-activity-log';

function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    clear: () => store.clear(),
    key: () => null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    get length() {
      return store.size;
    },
  };
}

describe('getStableWatchActivitySnapshot', () => {
  beforeEach(() => {
    resetWatchActivitySnapshotCache();
    vi.stubGlobal('localStorage', createLocalStorageMock());
    vi.stubGlobal('window', globalThis);
  });

  it('returns the same array reference when log data is unchanged', () => {
    localStorage.setItem(WATCH_ACTIVITY_STORAGE_KEY, '[]');

    const first = getStableWatchActivitySnapshot();
    const second = getStableWatchActivitySnapshot();

    expect(first).toBe(second);
    expect(first).toEqual([]);
  });

  it('returns a new reference after log updates', () => {
    localStorage.setItem(WATCH_ACTIVITY_STORAGE_KEY, '[]');
    const before = getStableWatchActivitySnapshot();

    localStorage.setItem(
      WATCH_ACTIVITY_STORAGE_KEY,
      JSON.stringify([
        {
          animeId: '1',
          episodeId: 'ep-1',
          watchedAt: 1_700_000_000_000,
        },
      ]),
    );

    const after = getStableWatchActivitySnapshot();
    expect(after).not.toBe(before);
    expect(after).toHaveLength(1);
  });
});
