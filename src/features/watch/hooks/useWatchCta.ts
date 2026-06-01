'use client';

import { useMemo } from 'react';

import {
  resolveWatchCtaModel,
  type EpisodeRef,
  type WatchCtaModel,
} from '@/features/watch/lib/resolve-watch-cta';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface UseWatchCtaParams {
  animeId: string;
  urlEp?: string;
  episodes: EpisodeRef[] | null;
}

/** Hero / series CTA: play href + label from watched state and episode catalog. */
export function useWatchCta({
  animeId,
  urlEp,
  episodes,
}: UseWatchCtaParams): WatchCtaModel {
  const [watched] = useLocalStorage<Record<string, boolean>>(`watched-${animeId}`, {});

  return useMemo(
    () =>
      resolveWatchCtaModel({
        animeId,
        urlEp,
        watched,
        episodes,
      }),
    [animeId, episodes, urlEp, watched],
  );
}
