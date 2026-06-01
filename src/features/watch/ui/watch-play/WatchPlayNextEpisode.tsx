'use client';

import Image from 'next/image';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { thumbnailUrl, LIST_THUMBNAIL_RES } from '@/shared/utils/thumbnail-url';
import './WatchPlayNextEpisode.scss';

interface WatchPlayNextEpisodeProps {
  nextEpisode: EpisodesTypes | null;
  posterUrl: string;
  isWatched: boolean;
  onSelect: (episodeId: string) => void;
}

export function WatchPlayNextEpisode({
  nextEpisode,
  posterUrl,
  isWatched,
  onSelect,
}: WatchPlayNextEpisodeProps) {
  if (!nextEpisode) return null;

  const episodeId =
    getEpisodeNumberFromId(nextEpisode.id) ?? String(nextEpisode.episode_no);
  const thumbSrc = thumbnailUrl(posterUrl, LIST_THUMBNAIL_RES);
  const epLabel = `E${nextEpisode.episode_no}`;
  const titleLine = nextEpisode.title
    ? `${epLabel} — ${nextEpisode.title}`
    : epLabel;

  return (
    <aside className="watch-play-next" aria-labelledby="watch-play-next-label">
      <p id="watch-play-next-label" className="watch-play-next__label">
        Next episode
      </p>
      <button
        type="button"
        className="watch-play-next__card"
        onClick={() => onSelect(episodeId)}
      >
        <div className="watch-play-next__thumb">
          {thumbSrc ? (
            <Image
              src={thumbSrc}
              alt=""
              fill
              sizes="160px"
              className="watch-play-next__img"
            />
          ) : null}
          {isWatched ? (
            <span className="watch-play-next__watched">Watched</span>
          ) : null}
        </div>
        <div className="watch-play-next__body">
          <p className="watch-play-next__title">{titleLine}</p>
          <p className="watch-play-next__langs">
            {nextEpisode.hasDub ? 'Dub' : null}
            {nextEpisode.hasDub && nextEpisode.hasSub !== false ? ' | ' : null}
            {nextEpisode.hasSub !== false ? 'Sub' : null}
          </p>
        </div>
      </button>
    </aside>
  );
}
