'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { thumbnailUrl, LIST_THUMBNAIL_RES } from '@/shared/utils/thumbnail-url';
import './WatchEpisodeCard.scss';

interface WatchEpisodeCardProps {
  item: EpisodesTypes;
  posterUrl: string;
  seriesTitle: string;
  episodeDuration: string | null;
  isActive: boolean;
  isWatched: boolean;
  nowPlaying?: boolean;
  onSelect: () => void;
}

export function WatchEpisodeCard({
  item,
  posterUrl,
  seriesTitle,
  episodeDuration,
  isActive,
  isWatched,
  nowPlaying = false,
  onSelect,
}: WatchEpisodeCardProps) {
  const epLabel = `E${item.episode_no}`;
  const thumbSrc = thumbnailUrl(posterUrl, LIST_THUMBNAIL_RES);

  return (
    <button
      type="button"
      className={`watch-episode-card${isActive ? ' watch-episode-card--active' : ''}${isWatched ? ' watch-episode-card--watched' : ''}${nowPlaying ? ' watch-episode-card--now-playing' : ''}`}
      onClick={onSelect}
    >
      <div className="watch-episode-card__thumb">
        {thumbSrc ? (
          <Image
            src={thumbSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1200px) 22vw, 280px"
            className="watch-episode-card__img"
          />
        ) : null}
        <span className="watch-episode-card__play" aria-hidden>
          <Play className="h-8 w-8 fill-white text-white" />
        </span>
        {episodeDuration ? (
          <span className="watch-episode-card__duration">{episodeDuration}</span>
        ) : null}
        {nowPlaying ? (
          <span className="watch-episode-card__now-playing">Now playing</span>
        ) : null}
        {isWatched && !nowPlaying ? (
          <span className="watch-episode-card__watched-overlay" aria-hidden>
            <span className="watch-episode-card__watched-label">Watched</span>
          </span>
        ) : null}
      </div>
      <div className="watch-episode-card__body">
        <p className="watch-episode-card__series">{seriesTitle}</p>
        <p className="watch-episode-card__title">
          {epLabel}
          {item.title ? ` — ${item.title}` : ''}
        </p>
        <p className="watch-episode-card__langs">
          {item.hasDub ? 'Dub' : null}
          {item.hasDub && item.hasSub ? ' | ' : null}
          {item.hasSub !== false ? 'Sub' : null}
        </p>
      </div>
    </button>
  );
}
