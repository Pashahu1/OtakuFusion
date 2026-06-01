'use client';

import { useMemo } from 'react';

import {
  resolveWatchCtaModel,
  type EpisodeRef,
  type WatchCtaModel,
} from '@/features/watch/lib/resolve-watch-cta';

export interface UseWatchCtaParams {
  animeId: string;
  urlEp?: string;
  episodes: EpisodeRef[] | null;
}

/** Hero / series CTA: play href + label from episode catalog. */
export function useWatchCta({
  animeId,
  urlEp,
  episodes,
}: UseWatchCtaParams): WatchCtaModel {
  return useMemo(
    () =>
      resolveWatchCtaModel({
        animeId,
        urlEp,
        episodes,
      }),
    [animeId, episodes, urlEp],
  );
}
