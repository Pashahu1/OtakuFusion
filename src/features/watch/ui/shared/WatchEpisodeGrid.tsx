'use client';

import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import {
  episodeMatchesSelection,
  getEpisodeNumberFromId,
} from '@/shared/utils/episodeUtils';
import { WatchEpisodeCard } from '@/features/watch/ui/watch-series/WatchEpisodeCard';

export interface WatchEpisodeGridProps {
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
  return (
    <div className={className}>
      {episodes.map((item) => {
        const epKey = getEpisodeNumberFromId(item.id) ?? String(item.episode_no);
        const isActive = episodeMatchesSelection(item, currentEpisodeId);
        const isWatched = Boolean(watchedEpisodes[epKey]);

        return (
          <WatchEpisodeCard
            key={`${item.id}-${item.episode_no}`}
            item={item}
            posterUrl={posterUrl}
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
