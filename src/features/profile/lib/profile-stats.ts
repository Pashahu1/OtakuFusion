import {
  format,
  startOfDay,
  startOfWeek,
  subDays,
  subWeeks,
  eachDayOfInterval,
  differenceInCalendarDays,
} from 'date-fns';

import { tStatic } from '@/i18n/t';

import type { WatchActivityEntry } from './watch-activity-log';

export interface ProfileStatsSummary {
  totalAnime: number;
  daysWatched: number;
  episodesWatched: number;
  favoritesCount: number;
  currentStreak: number;
}

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface HeatmapCell {
  dateKey: string;
  count: number;
  level: HeatmapLevel;
}

export interface ProfileDashboardData {
  stats: ProfileStatsSummary;
  heatmap: HeatmapCell[];
  genres: GenreStat[];
  activity: WatchActivityEntry[];
}

const GENRE_COLORS: Record<string, string> = {
  Action: '#22c55e',
  Adventure: '#ec4899',
  Comedy: '#f47521',
  Drama: '#a855f7',
  Fantasy: '#3b82f6',
  Romance: '#f43f5e',
  'Sci-Fi': '#06b6d4',
  Slice: '#eab308',
  Sports: '#14b8a6',
  Supernatural: '#6366f1',
  Mystery: '#84cc16',
  Horror: '#ef4444',
};

const FALLBACK_GENRE_COLORS = [
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#f47521',
  '#ec4899',
  '#06b6d4',
  '#eab308',
  '#14b8a6',
];

const HEATMAP_WEEKS = 20;

const MILESTONE_LADDERS: number[][] = [
  [10, 25, 50],
  [50, 100, 150],
  [100, 150, 200],
  [200, 350, 500],
  [500, 750, 1000],
  [1000, 2500, 5000],
  [2500, 5000, 7500],
  [5000, 7500, 10000],
];

export interface MilestoneScale {
  ticks: number[];
  max: number;
  percent: number;
}

export function milestoneScale(value: number): MilestoneScale {
  const safeValue = Math.max(0, value);
  const ticks =
    MILESTONE_LADDERS.find((ladder) => (ladder.at(-1) ?? 0) > safeValue) ??
    MILESTONE_LADDERS[MILESTONE_LADDERS.length - 1];
  const max = ticks.at(-1) ?? 50;

  return {
    ticks,
    max,
    percent: max === 0 ? 0 : Math.min(100, (safeValue / max) * 100),
  };
}

function dateKeyLocal(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function countToHeatLevel(count: number): HeatmapLevel {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  if (count <= 10) return 4;
  return 5;
}

export function countToStatLevel(count: number): HeatmapLevel {
  if (count <= 0) return 0;
  if (count < 10) return 1;
  if (count < 25) return 2;
  if (count < 50) return 3;
  if (count < 100) return 4;
  return 5;
}

function genreColor(name: string, index: number): string {
  for (const [key, color] of Object.entries(GENRE_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return FALLBACK_GENRE_COLORS[index % FALLBACK_GENRE_COLORS.length];
}

function buildDailyCounts(entries: WatchActivityEntry[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const entry of entries) {
    const key = dateKeyLocal(new Date(entry.watchedAt));
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export interface GenreStat {
  name: string;
  count: number;
  color: string;
}

function buildHeatmap(dailyCounts: Map<string, number>): HeatmapCell[] {
  const end = startOfDay(new Date());
  const start = startOfWeek(subWeeks(end, HEATMAP_WEEKS - 1), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });

  return days.map((date) => {
    const key = dateKeyLocal(date);
    const count = dailyCounts.get(key) ?? 0;
    return {
      dateKey: key,
      count,
      level: countToHeatLevel(count),
    };
  });
}

function computeStreak(dailyCounts: Map<string, number>): number {
  let streak = 0;
  let cursor = startOfDay(new Date());
  while (true) {
    const key = dateKeyLocal(cursor);
    if ((dailyCounts.get(key) ?? 0) > 0) {
      streak += 1;
      cursor = subDays(cursor, 1);
      continue;
    }
    break;
  }
  return streak;
}

function buildGenreStats(entries: WatchActivityEntry[]): GenreStat[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const genre of entry.genres ?? []) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count], index) => ({
      name,
      count,
      color: genreColor(name, index),
    }));
}

export function buildProfileDashboardData(
  activity: WatchActivityEntry[],
  favoritesCount: number,
  watchedEpisodesFromStorage: number,
): ProfileDashboardData {
  const dailyCounts = buildDailyCounts(activity);
  const uniqueAnime = new Set(activity.map((e) => e.animeId));
  const episodesFromLog = activity.length;
  const episodesWatched = Math.max(episodesFromLog, watchedEpisodesFromStorage);

  const heatmap = buildHeatmap(dailyCounts);

  return {
    stats: {
      totalAnime: uniqueAnime.size,
      daysWatched: dailyCounts.size,
      episodesWatched,
      favoritesCount,
      currentStreak: computeStreak(dailyCounts),
    },
    heatmap,
    genres: buildGenreStats(activity),
    activity: activity.slice(0, 24),
  };
}

export function formatActivityRelativeTime(watchedAt: number): string {
  const days = differenceInCalendarDays(new Date(), new Date(watchedAt));
  if (days <= 0) return tStatic('profile.relativeToday');
  if (days === 1) return tStatic('profile.relativeYesterday');
  if (days < 7) return tStatic('profile.relativeDays', { count: days });
  if (days < 30) return tStatic('profile.relativeWeeks', { count: Math.floor(days / 7) });
  if (days < 365) return tStatic('profile.relativeMonths', { count: Math.floor(days / 30) });
  return tStatic('profile.relativeYears', { count: Math.floor(days / 365) });
}

export function heatmapWeekColumns(cells: HeatmapCell[]): HeatmapCell[][] {
  const weeks: HeatmapCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
