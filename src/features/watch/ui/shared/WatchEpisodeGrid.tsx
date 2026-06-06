'use client';

import { useMemo } from 'react';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import {
  episodeMatchesSelection,
  normalizeEpisodeStorageKey,
} from '@/shared/utils/episodeUtils';
import { WatchEpisodeCard } from '@/features/watch/ui/watch-series/WatchEpisodeCard';
import { useEpisodePreviewMap } from '@/features/watch/hooks/useEpisodePreviewObjectUrl';
import { useContinueWatchingEpisodeProgress } from '@/features/watch/hooks/useContinueWatchingEpisodeProgress';

export interface WatchEpisodeGridProps {
  animeId: string;
  episodes: EpisodesTypes[];
  currentEpisodeId: string | null;
  watchedEpisodes: Record<string, boolean>;
  posterUrl: string;
  seriesTitle: string;
  episodeDuration: string | null;
  onSelectEpisode: (episodeId: string) => void;
  className?: string;
  showNowPlayingBadge?: boolean;
}

export function WatchEpisodeGrid({
  animeId,
  episodes,
  currentEpisodeId,
  watchedEpisodes,
  posterUrl,
  seriesTitle,
  episodeDuration,
  onSelectEpisode,
  className,
  showNowPlayingBadge = false,
}: WatchEpisodeGridProps) {
  const episodeKeys = useMemo(
    () =>
      episodes.map((item) =>
        normalizeEpisodeStorageKey(item.id, item.episode_no),
      ),
    [episodes],
  );

  const previewMap = useEpisodePreviewMap(animeId, episodeKeys);
  const continueProgress = useContinueWatchingEpisodeProgress(animeId);

  return (
    <div className={className}>
      {episodes.map((item) => {
        const epKey = normalizeEpisodeStorageKey(item.id, item.episode_no);
        const isActive = episodeMatchesSelection(item, currentEpisodeId);
        const isWatched = Boolean(watchedEpisodes[epKey]);
        const progressRatio =
          continueProgress?.episodeKey === epKey ? continueProgress.progressRatio : 0;

        return (
          <WatchEpisodeCard
            key={`${item.id}-${item.episode_no}`}
            item={item}
            posterUrl={posterUrl}
            episodePreviewUrl={previewMap[epKey] ?? null}
            progressRatio={progressRatio}
            seriesTitle={seriesTitle}
            episodeDuration={episodeDuration}
            isActive={isActive}
            isWatched={isWatched}
            nowPlaying={showNowPlayingBadge && isActive}
            onSelect={() => onSelectEpisode(epKey)}
          />
        );
      })}
    </div>
  );
}
