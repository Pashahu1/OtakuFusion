import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import { normalizeWatchStreamProvider } from '@/features/watch/lib/watch-provider';

import { continueWatchingEpisodeParam } from './continue-watching-display';
import { readContinueWatchingList } from './continue-watching-list';
import { findContinueWatchingEntry } from './resolve-continue-watching-cta';

export interface ContinueWatchingPlaybackPrefs {
  watchStreamProvider?: WatchStreamProvider;
  streamLang?: 'sub' | 'dub';
  positionSeconds?: number;
}

/** Sync read — apply saved provider/lang before first stream resolve (Continue watching). */
export function readContinueWatchingPlaybackPrefs(
  animeId: string,
  episodeKey: string | null | undefined,
): ContinueWatchingPlaybackPrefs | null {
  if (typeof window === 'undefined') return null;

  const id = animeId.trim();
  const ep = episodeKey?.trim();
  if (!id || !ep) return null;

  const entry = findContinueWatchingEntry(readContinueWatchingList(), id);
  if (!entry) return null;

  const savedEp = continueWatchingEpisodeParam(entry);
  if (savedEp !== ep) return null;

  const prefs: ContinueWatchingPlaybackPrefs = {};

  if (entry.watchStreamProvider) {
    prefs.watchStreamProvider = normalizeWatchStreamProvider(entry.watchStreamProvider);
  }
  if (entry.streamLang === 'sub' || entry.streamLang === 'dub') {
    prefs.streamLang = entry.streamLang;
  }
  if (entry.positionSeconds != null && Number.isFinite(entry.positionSeconds)) {
    prefs.positionSeconds = Math.floor(entry.positionSeconds);
  }

  return prefs;
}
