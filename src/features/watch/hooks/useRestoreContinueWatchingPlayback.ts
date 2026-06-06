import { useEffect, useRef } from 'react';

import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import { findContinueWatchingEntry } from '@/features/watch/lib/resolve-continue-watching-cta';
import { readContinueWatchingList } from '@/features/watch/lib/continue-watching-list';
import { continueWatchingEpisodeParam } from '@/features/watch/lib/continue-watching-display';

interface UseRestoreContinueWatchingPlaybackInput {
  animeId: string;
  episodeId: string | null;
  urlEpisodeId?: string;
  skipRestore?: boolean;
  setWatchStreamProvider: (next: WatchStreamProvider) => void;
  setActiveServerId: (id: string | null) => void;
}

/**
 * Restore saved language/provider when episode is picked from Continue watching
 * without `?ep=` in the URL (hero CTA path). URL `?ep=` prefs are applied synchronously in useWatch.
 */
export function useRestoreContinueWatchingPlayback({
  animeId,
  episodeId,
  urlEpisodeId,
  skipRestore = false,
  setWatchStreamProvider,
  setActiveServerId,
}: UseRestoreContinueWatchingPlaybackInput): void {
  const appliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (skipRestore || urlEpisodeId?.trim()) return;
    if (!animeId.trim() || !episodeId?.trim()) return;

    const token = `${animeId}:${episodeId}`;
    if (appliedRef.current === token) return;

    const entry = findContinueWatchingEntry(readContinueWatchingList(), animeId);
    if (!entry) return;

    const savedEp = continueWatchingEpisodeParam(entry);
    if (savedEp !== String(episodeId)) return;

    appliedRef.current = token;

    if (entry.watchStreamProvider) {
      setWatchStreamProvider(entry.watchStreamProvider);
    }
    if (entry.streamLang === 'dub') {
      setActiveServerId('2');
    } else if (entry.streamLang === 'sub') {
      setActiveServerId('1');
    }
  }, [
    animeId,
    episodeId,
    urlEpisodeId,
    skipRestore,
    setWatchStreamProvider,
    setActiveServerId,
  ]);
}
