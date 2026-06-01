import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildProfileDashboardData,
  formatActivityRelativeTime,
  heatmapWeekColumns,
} from './profile-stats';
import type { WatchActivityEntry } from './watch-activity-log';

function entry(
  partial: Partial<WatchActivityEntry> & Pick<WatchActivityEntry, 'animeId' | 'episodeId' | 'watchedAt'>,
): WatchActivityEntry {
  return {
    animeId: partial.animeId,
    episodeId: partial.episodeId,
    watchedAt: partial.watchedAt,
    genres: partial.genres,
    title: partial.title,
  };
}

describe('buildProfileDashboardData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T15:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('aggregates stats, genres, and caps recent activity', () => {
    const today = new Date('2026-06-01T10:00:00').getTime();
    const yesterday = new Date('2026-05-31T20:00:00').getTime();

    const activity = [
      entry({ animeId: 'a', episodeId: '1', watchedAt: today, genres: ['Action', 'Comedy'] }),
      entry({ animeId: 'a', episodeId: '2', watchedAt: today, genres: ['Action'] }),
      entry({ animeId: 'b', episodeId: '1', watchedAt: yesterday, genres: ['Drama'] }),
    ];

    const dashboard = buildProfileDashboardData(activity, 3, 1);

    expect(dashboard.stats).toMatchObject({
      totalAnime: 2,
      daysWatched: 2,
      episodesWatched: 3,
      favoritesCount: 3,
      currentStreak: 2,
    });
    expect(dashboard.genres[0]).toMatchObject({ name: 'Action', count: 2 });
    expect(dashboard.activity).toHaveLength(3);
    expect(dashboard.heatmap.at(-1)?.count).toBe(2);
  });

  it('uses watchedEpisodesFromStorage when it exceeds log length', () => {
    const dashboard = buildProfileDashboardData([], 0, 12);
    expect(dashboard.stats.episodesWatched).toBe(12);
  });
});

describe('formatActivityRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats relative labels', () => {
    const now = Date.now();
    expect(formatActivityRelativeTime(now)).toBe('Today');
    expect(formatActivityRelativeTime(now - 86_400_000)).toBe('Yesterday');
    expect(formatActivityRelativeTime(now - 3 * 86_400_000)).toBe('3 days ago');
  });
});

describe('heatmapWeekColumns', () => {
  it('chunks cells into weeks of seven', () => {
    const cells = Array.from({ length: 15 }, (_, i) => ({
      dateKey: `2026-01-${String(i + 1).padStart(2, '0')}`,
      count: 0,
      level: 0 as const,
    }));

    expect(heatmapWeekColumns(cells)).toEqual([cells.slice(0, 7), cells.slice(7, 14), cells.slice(14)]);
  });
});
