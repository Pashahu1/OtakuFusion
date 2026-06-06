import { isBlockedAnimeInfo } from '@/lib/anime-content-policy';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

export const CONTINUE_WATCHING_STORAGE_KEY = 'continueWatching';

/** How many titles to keep in localStorage (MRU). */
const MAX_STORED_ENTRIES = 40;

type StoredEntry = {
  id: string;
  data_id: number;
  episodeId: string;
  episodeNum?: number | null;
  positionSeconds?: number;
  durationSeconds?: number;
  adultContent?: boolean;
  genres?: string[];
  poster?: string;
  title?: string;
  japanese_title?: string;
  updatedAt?: number;
  watchStreamProvider?: WatchStreamProvider;
  streamLang?: 'sub' | 'dub';
};

function emitContinueWatchingUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('continueWatchingUpdated'));
}

function readRawList(): StoredEntry[] {
  try {
    const raw = localStorage.getItem(CONTINUE_WATCHING_STORAGE_KEY) || '[]';
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredEntry[]) : [];
  } catch {
    return [];
  }
}

function persistAndNotify(list: StoredEntry[]): void {
  localStorage.setItem(CONTINUE_WATCHING_STORAGE_KEY, JSON.stringify(list));
  emitContinueWatchingUpdated();
}

export interface ContinueWatchingProgress {
  positionSeconds: number;
  durationSeconds: number;
}

export interface ContinueWatchingPlaybackContext {
  watchStreamProvider?: WatchStreamProvider;
  streamLang?: 'sub' | 'dub';
}

/**
 * Updates continue watching: on rewatch title moves to end of list (MRU),
 * so tail slice does not drop the title just watched.
 */
export function updateContinueWatching(
  animeInfo: AnimeInfo | null,
  episodeId: string | null,
  episodeNum: number | null,
  progress?: ContinueWatchingProgress,
  playback?: ContinueWatchingPlaybackContext,
): void {
  if (typeof window === 'undefined') return;
  if (!animeInfo || !animeInfo.id || !animeInfo.data_id) return;
  if (!episodeId) return;
  if (isBlockedAnimeInfo({ genres: animeInfo.genres })) return;

  try {
    const continueWatching = readRawList();
    const existing = continueWatching.find(
      (item) => item.data_id === animeInfo.data_id || item.id === animeInfo.id,
    );

    const filtered = continueWatching.filter(
      (item) => item.data_id !== animeInfo.data_id && item.id !== animeInfo.id,
    );

    const newEntry: StoredEntry = {
      id: animeInfo.id,
      data_id: animeInfo.data_id,
      episodeId,
      episodeNum,
      adultContent: animeInfo.adultContent,
      genres: animeInfo.genres,
      poster: animeInfo.poster,
      title: animeInfo.title,
      japanese_title: animeInfo.japanese_title,
      updatedAt: Date.now(),
      positionSeconds: progress?.positionSeconds ?? existing?.positionSeconds,
      durationSeconds: progress?.durationSeconds ?? existing?.durationSeconds,
      watchStreamProvider:
        playback?.watchStreamProvider ?? existing?.watchStreamProvider,
      streamLang: playback?.streamLang ?? existing?.streamLang,
    };

    if (progress) {
      newEntry.positionSeconds = progress.positionSeconds;
      newEntry.durationSeconds = progress.durationSeconds;
    }

    if (playback?.watchStreamProvider) {
      newEntry.watchStreamProvider = playback.watchStreamProvider;
    }
    if (playback?.streamLang) {
      newEntry.streamLang = playback.streamLang;
    }

    filtered.push(newEntry);
    const capped =
      filtered.length > MAX_STORED_ENTRIES
        ? filtered.slice(-MAX_STORED_ENTRIES)
        : filtered;

    persistAndNotify(capped);
  } catch {
    return;
  }
}

/** Remove title after watching last episode (or manually). */
export function removeFromContinueWatching(animeId: string, data_id: number): void {
  if (typeof window === 'undefined') return;
  if (!animeId || !Number.isFinite(data_id)) return;

  try {
    const list = readRawList();
    const next = list.filter((item) => item.id !== animeId && item.data_id !== data_id);
    if (next.length === list.length) return;
    persistAndNotify(next);
  } catch {
    return;
  }
}
