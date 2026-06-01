import { CONTINUE_WATCHING_STORAGE_KEY } from '@/features/player';

export const WATCH_ACTIVITY_STORAGE_KEY = 'watchActivityLog';
const LEGACY_MIGRATION_KEY = 'watchActivityLegacyMigrated_v1';
const MAX_ENTRIES = 600;
const DUPLICATE_WINDOW_MS = 60 * 60 * 1000;

export interface WatchActivityEntry {
  animeId: string;
  data_id?: number;
  title?: string;
  poster?: string;
  episodeId: string;
  episodeNum?: number;
  genres?: string[];
  watchedAt: number;
}

export interface AppendWatchActivityInput {
  animeId: string;
  data_id?: number;
  title?: string;
  poster?: string;
  episodeId: string;
  episodeNum?: number | null;
  genres?: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseEntry(raw: unknown): WatchActivityEntry | null {
  if (!isRecord(raw)) return null;
  const animeId = raw.animeId;
  const episodeId = raw.episodeId;
  const watchedAt = raw.watchedAt;
  if (typeof animeId !== 'string' || animeId === '') return null;
  if (typeof episodeId !== 'string' || episodeId === '') return null;
  if (typeof watchedAt !== 'number' || !Number.isFinite(watchedAt)) return null;

  const data_idRaw = raw.data_id;
  const data_id =
    typeof data_idRaw === 'number'
      ? data_idRaw
      : typeof data_idRaw === 'string'
        ? Number(data_idRaw)
        : undefined;

  const episodeNumRaw = raw.episodeNum;
  const episodeNum =
    typeof episodeNumRaw === 'number' && Number.isFinite(episodeNumRaw)
      ? episodeNumRaw
      : undefined;

  return {
    animeId,
    data_id: Number.isFinite(data_id) ? data_id : undefined,
    title: typeof raw.title === 'string' ? raw.title : undefined,
    poster: typeof raw.poster === 'string' ? raw.poster : undefined,
    episodeId,
    episodeNum,
    genres: Array.isArray(raw.genres)
      ? raw.genres.filter((g): g is string => typeof g === 'string')
      : undefined,
    watchedAt,
  };
}

function readRawLog(): WatchActivityEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(WATCH_ACTIVITY_STORAGE_KEY) || '[]',
    );
    if (!Array.isArray(parsed)) return [];
    const valid: WatchActivityEntry[] = [];
    for (const item of parsed) {
      const entry = parseEntry(item);
      if (entry) valid.push(entry);
    }
    return valid.sort((a, b) => b.watchedAt - a.watchedAt);
  } catch {
    return [];
  }
}

function persistLog(entries: WatchActivityEntry[]): void {
  localStorage.setItem(WATCH_ACTIVITY_STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event('watchActivityUpdated'));
}

function migrateLegacyContinueWatching(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(LEGACY_MIGRATION_KEY)) return;

  try {
    const raw = localStorage.getItem(CONTINUE_WATCHING_STORAGE_KEY) || '[]';
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(LEGACY_MIGRATION_KEY, '1');
      return;
    }

    const existing = readRawLog();
    const seeded: WatchActivityEntry[] = [...existing];

    for (const item of parsed) {
      if (!isRecord(item)) continue;
      const animeId = item.id;
      const episodeId = item.episodeId;
      const updatedAt = item.updatedAt;
      if (typeof animeId !== 'string' || typeof episodeId !== 'string') continue;
      if (typeof updatedAt !== 'number' || !Number.isFinite(updatedAt)) continue;

      const data_idRaw = item.data_id;
      const data_id =
        typeof data_idRaw === 'number'
          ? data_idRaw
          : typeof data_idRaw === 'string'
            ? Number(data_idRaw)
            : undefined;

      seeded.push({
        animeId,
        data_id: Number.isFinite(data_id) ? data_id : undefined,
        title: typeof item.title === 'string' ? item.title : undefined,
        poster: typeof item.poster === 'string' ? item.poster : undefined,
        episodeId,
        episodeNum:
          typeof item.episodeNum === 'number' ? item.episodeNum : undefined,
        genres: Array.isArray(item.genres)
          ? item.genres.filter((g): g is string => typeof g === 'string')
          : undefined,
        watchedAt: updatedAt,
      });
    }

    const deduped = dedupeEntries(seeded);
    persistLog(deduped.slice(0, MAX_ENTRIES));
    localStorage.setItem(LEGACY_MIGRATION_KEY, '1');
  } catch {
    localStorage.setItem(LEGACY_MIGRATION_KEY, '1');
  }
}

function dedupeEntries(entries: WatchActivityEntry[]): WatchActivityEntry[] {
  const seen = new Set<string>();
  const result: WatchActivityEntry[] = [];
  for (const entry of entries.sort((a, b) => b.watchedAt - a.watchedAt)) {
    const key = `${entry.animeId}:${entry.episodeId}:${entry.watchedAt}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
  }
  return result;
}

export function readWatchActivityLog(): WatchActivityEntry[] {
  migrateLegacyContinueWatching();
  return readRawLog();
}

export function appendWatchActivity(input: AppendWatchActivityInput): void {
  if (typeof window === 'undefined') return;
  const episodeId = String(input.episodeId);
  if (!input.animeId || !episodeId) return;

  const now = Date.now();
  const current = readRawLog();
  const recent = current[0];
  if (
    recent &&
    recent.animeId === input.animeId &&
    recent.episodeId === episodeId &&
    now - recent.watchedAt < DUPLICATE_WINDOW_MS
  ) {
    return;
  }

  const entry: WatchActivityEntry = {
    animeId: input.animeId,
    data_id: input.data_id,
    title: input.title,
    poster: input.poster,
    episodeId,
    episodeNum:
      typeof input.episodeNum === 'number' && Number.isFinite(input.episodeNum)
        ? input.episodeNum
        : undefined,
    genres: input.genres,
    watchedAt: now,
  };

  const next = dedupeEntries([entry, ...current]).slice(0, MAX_ENTRIES);
  persistLog(next);
}

export function countWatchedEpisodesInStorage(): number {
  if (typeof window === 'undefined') return 0;
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith('watched-')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) continue;
      total += Object.values(parsed).filter((v) => v === true).length;
    }
  } catch {
    return total;
  }
  return total;
}
