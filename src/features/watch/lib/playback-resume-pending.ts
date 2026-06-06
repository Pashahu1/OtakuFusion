import { normalizeEpisodeStorageKey } from '@/shared/utils/episodeUtils';

const SESSION_STORAGE_KEY = 'otakufusion-pending-resume-v1';
const SESSION_TTL_MS = 15 * 60 * 1000;

function resumeKey(animeId: string, episodeId: string): string {
  return `${animeId.trim()}:${episodeId.trim()}`;
}

const pendingResumeSeconds = new Map<string, number>();

interface SessionResumeEntry {
  positionSeconds: number;
  savedAt: number;
}

function readSessionResumeMap(): Record<string, SessionResumeEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, SessionResumeEntry>) : {};
  } catch {
    return {};
  }
}

function writeSessionResumeMap(map: Record<string, SessionResumeEntry>): void {
  if (typeof window === 'undefined') return;
  try {
    if (Object.keys(map).length === 0) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota / private mode */
  }
}

function readSessionResume(key: string): number | undefined {
  const entry = readSessionResumeMap()[key];
  if (!entry || !Number.isFinite(entry.positionSeconds)) return undefined;
  if (Date.now() - entry.savedAt > SESSION_TTL_MS) return undefined;
  return Math.floor(entry.positionSeconds);
}

function writeSessionResume(key: string, positionSeconds: number): void {
  const map = readSessionResumeMap();
  map[key] = { positionSeconds: Math.floor(positionSeconds), savedAt: Date.now() };
  writeSessionResumeMap(map);
}

function deleteSessionResume(key: string): void {
  const map = readSessionResumeMap();
  if (!(key in map)) return;
  delete map[key];
  writeSessionResumeMap(map);
}

function resolveEpisodeKey(
  animeId: string,
  episodeId: string,
  episodeNum?: number | null,
): { animeKey: string; episodeKey: string; mapKey: string } | null {
  const animeKey = animeId.trim();
  const episodeKey = normalizeEpisodeStorageKey(episodeId, episodeNum);
  if (!animeKey || !episodeKey) return null;
  return { animeKey, episodeKey, mapKey: resumeKey(animeKey, episodeKey) };
}

export function peekPendingPlaybackResume(
  animeId: string,
  episodeId: string,
  episodeNum?: number | null,
): number | undefined {
  const resolved = resolveEpisodeKey(animeId, episodeId, episodeNum);
  if (!resolved) return undefined;

  const fromMemory = pendingResumeSeconds.get(resolved.mapKey);
  if (fromMemory != null) return fromMemory;

  return readSessionResume(resolved.mapKey);
}

export function setPendingPlaybackResume(
  animeId: string,
  episodeId: string,
  positionSeconds: number,
  episodeNum?: number | null,
): void {
  const resolved = resolveEpisodeKey(animeId, episodeId, episodeNum);
  if (!resolved || !Number.isFinite(positionSeconds) || positionSeconds < 0) return;

  const value = Math.floor(positionSeconds);
  pendingResumeSeconds.set(resolved.mapKey, value);
  writeSessionResume(resolved.mapKey, value);
}

export function consumePendingPlaybackResume(
  animeId: string,
  episodeId: string,
  episodeNum?: number | null,
): number | undefined {
  const resolved = resolveEpisodeKey(animeId, episodeId, episodeNum);
  if (!resolved) return undefined;

  const value =
    pendingResumeSeconds.get(resolved.mapKey) ?? readSessionResume(resolved.mapKey);
  if (value == null) return undefined;

  pendingResumeSeconds.delete(resolved.mapKey);
  deleteSessionResume(resolved.mapKey);
  return value;
}
