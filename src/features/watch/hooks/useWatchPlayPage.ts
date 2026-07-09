'use client';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSearchParams } from 'next/navigation';import { useCallback, useRef, useState } from 'react';
import { useWatch } from './useWatch';
import { useWatchPageEffects } from './useWatchPageEffects';
import { onEpisodeWatched as markWatchedInStorage } from '@/lib/watch/watched-episodes';
import { appendWatchActivity } from '@/features/profile';
import type { UseWatchReturn } from '@/shared/types/UseWatchReturn';

interface UseWatchPlayPageResult {
    watch: UseWatchReturn;
    animeId: string;
    watchedEpisodes: Record<string, boolean>;
    onEpisodeWatched: (episodeId: string) => void;
    showErrorBlock: boolean;
  }

export function useWatchPlayPage(animeId: string): UseWatchPlayPageResult {
    const urlEp = useSearchParams().get('ep') ?? undefined;
    const [showErrorBlock, setShowErrorBlock] = useState(false);
  
    const [watchedEpisodes, setWatchedEpisodes] = useLocalStorage<Record<string, boolean>>(
      `watched-${animeId}`,
      {}
    );
  
    const watch = useWatch(animeId, urlEp ?? undefined);
  
    const errorBlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasAppliedSavedEpisodeRef = useRef(false);

    useWatchPageEffects(
        animeId,
        watch.setEpisodeId,
        watch.episodeId,
        watch.episodes,
        urlEp,
        hasAppliedSavedEpisodeRef,
        watch.buffering,
        watch.streamUrl,
        watch.playerShellPending,
        watch.animeInfo,
        errorBlockTimerRef,
        setShowErrorBlock,
      );
    
      const onEpisodeWatched = useCallback(
        (id: string) => {
          markWatchedInStorage(id, setWatchedEpisodes);
          const info = watch.animeInfo;
          if (!info?.id) return;

          appendWatchActivity({
            animeId: info.id,
            data_id: info.data_id,
            title: info.title ?? info.japanese_title,
            poster: info.poster,
            episodeId: id,
            episodeNum: watch.activeEpisodeNum,
            genres: info.animeInfo?.Genres,
          });
        },
        [setWatchedEpisodes, watch.animeInfo, watch.activeEpisodeNum],
      );

      return {
        watch,
        animeId,
        watchedEpisodes,
        onEpisodeWatched,
        showErrorBlock,
      }
}