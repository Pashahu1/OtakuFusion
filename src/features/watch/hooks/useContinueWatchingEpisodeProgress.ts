'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  continueWatchingEpisodeParam,
  continueWatchingProgressRatio,
} from '@/features/watch/lib/continue-watching-display';
import { readContinueWatchingList } from '@/features/watch/lib/continue-watching-list';
import { findContinueWatchingEntry } from '@/features/watch/lib/resolve-continue-watching-cta';

export interface ContinueWatchingEpisodeProgress {
  episodeKey: string;
  progressRatio: number;
}

export function useContinueWatchingEpisodeProgress(
  animeId: string,
): ContinueWatchingEpisodeProgress | null {
  const [state, setState] = useState<ContinueWatchingEpisodeProgress | null>(null);

  const refresh = useCallback(() => {
    if (!animeId.trim()) {
      setState(null);
      return;
    }

    const entry = findContinueWatchingEntry(readContinueWatchingList(), animeId);
    if (!entry) {
      setState(null);
      return;
    }

    const progressRatio = continueWatchingProgressRatio(
      entry.positionSeconds,
      entry.durationSeconds,
    );
    if (progressRatio <= 0) {
      setState(null);
      return;
    }

    setState({
      episodeKey: continueWatchingEpisodeParam(entry),
      progressRatio,
    });
  }, [animeId]);

  useEffect(() => {
    refresh();
    window.addEventListener('continueWatchingUpdated', refresh);
    return () => window.removeEventListener('continueWatchingUpdated', refresh);
  }, [refresh]);

  return state;
}
