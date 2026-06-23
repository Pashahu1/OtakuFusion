'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { WATCH_PLAY_NEXT_THUMB_QUALITY } from '@/lib/anime-card-poster';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { thumbnailUrl, LIST_THUMBNAIL_RES } from '@/shared/utils/thumbnail-url';
import './WatchPlayAdjacentEpisode.scss';

interface WatchPlayAdjacentEpisodeProps {
  label: string;
  episode: EpisodesTypes;
  posterUrl: string;
  progressRatio: number;
  onSelect: (episodeId: string) => void;
}

export function WatchPlayAdjacentEpisode({
  label,
  episode,
  posterUrl,
  progressRatio,
  onSelect,
}: WatchPlayAdjacentEpisodeProps) {
  const episodeId =
    getEpisodeNumberFromId(episode.id) ?? String(episode.episode_no);
  const thumbSrc = thumbnailUrl(posterUrl, LIST_THUMBNAIL_RES);
  const epLabel = `E${episode.episode_no}`;
  const titleLine = episode.title ? `${epLabel} — ${episode.title}` : epLabel;
  const langLine = [
    episode.hasDub ? 'Dub' : null,
    episode.hasSub !== false ? 'Sub' : null,
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <aside className="watch-play-adjacent" aria-labelledby={`watch-play-adjacent-${episodeId}`}>
      <p id={`watch-play-adjacent-${episodeId}`} className="watch-play-adjacent__label">
        {label}
      </p>
      <button
        type="button"
        className="watch-play-adjacent__card"
        onClick={() => onSelect(episodeId)}
      >
        <div className="watch-play-adjacent__thumb">
          {thumbSrc ? (
            <Image
              src={thumbSrc}
              alt=""
              fill
              loading="lazy"
              sizes="160px"
              quality={WATCH_PLAY_NEXT_THUMB_QUALITY}
              className="watch-play-adjacent__img"
            />
          ) : null}
          <span className="watch-play-adjacent__play" aria-hidden>
            <Play className="h-7 w-7 fill-white text-white" />
          </span>
          {progressRatio > 0 ? (
            <div
              className="watch-play-adjacent__progress"
              style={{ width: `${Math.min(100, progressRatio * 100)}%` }}
              aria-hidden
            />
          ) : null}
        </div>
        <div className="watch-play-adjacent__body">
          <p className="watch-play-adjacent__title">{titleLine}</p>
          {langLine ? <p className="watch-play-adjacent__langs">{langLine}</p> : null}
        </div>
      </button>
    </aside>
  );
}
