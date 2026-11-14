import { isBlockedAnimeInfo } from '@/lib/anime-content-policy';
import type { WatchPlaybackAudio } from '@/features/watch/lib/playback-audio';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import {
  MAX_CONTINUE_WATCHING_ENTRIES,
  readContinueWatchingList,
  writeContinueWatchingList,
} from '@/features/watch/lib/continue-watching-list';
import {
  scheduleContinueWatchingServerDelete,
  scheduleContinueWatchingServerUpsert,
} from '@/features/watch/lib/continue-watching-sync';
import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

export { CONTINUE_WATCHING_STORAGE_KEY } from '@/features/watch/lib/continue-watching-list';

export interface ContinueWatchingProgress {
  positionSeconds: number;
  durationSeconds: number;
}

export interface ContinueWatchingPlaybackContext {
  watchStreamProvider?: WatchStreamProvider;
  streamLang?: 'sub' | 'dub';
  playbackAudio?: WatchPlaybackAudio;
}

/**
 * Updates continue watching: on rewatch title moves to front (MRU).
 * Local cache writes immediately; signed-in users sync to the account (debounced).
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
    const continueWatching = readContinueWatchingList();
    const existing = continueWatching.find(
      (item) => item.data_id === animeInfo.data_id || item.id === animeInfo.id,
    );

    const filtered = continueWatching.filter(
      (item) => item.data_id !== animeInfo.data_id && item.id !== animeInfo.id,
    );

    const newEntry: ContinueWatchingEntry = {
      id: animeInfo.id,
      data_id: animeInfo.data_id,
      episodeId,
      episodeNum: episodeNum ?? undefined,
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
      playbackAudio: playback?.playbackAudio ?? existing?.playbackAudio,
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
    if (playback?.playbackAudio) {
      newEntry.playbackAudio = playback.playbackAudio;
    }

    writeContinueWatchingList(
      [newEntry, ...filtered].slice(0, MAX_CONTINUE_WATCHING_ENTRIES),
    );
    scheduleContinueWatchingServerUpsert(newEntry);
  } catch {
    return;
  }
}

/** Remove title after watching last episode (or manually). */
export function removeFromContinueWatching(animeId: string, data_id: number): void {
  if (typeof window === 'undefined') return;
  if (!animeId || !Number.isFinite(data_id)) return;

  try {
    const list = readContinueWatchingList();
    const next = list.filter((item) => item.id !== animeId && item.data_id !== data_id);
    if (next.length === list.length) return;
    writeContinueWatchingList(next);
    scheduleContinueWatchingServerDelete(animeId);
  } catch {
    return;
  }
}
