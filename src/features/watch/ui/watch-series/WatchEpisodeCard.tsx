'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import { formatEpisodeCardTitle } from '@/features/watch/lib/format-episode-card-title';
import { formatEpisodeLangLine, type WatchPlaybackLanguages } from '@/features/watch/lib/watch-availability';
import { episodeThumbObjectPosition } from '@/features/watch/lib/episode-thumb-position';
import { WATCH_EPISODE_THUMB_QUALITY } from '@/lib/anime-card-poster';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { thumbnailUrl, LIST_THUMBNAIL_RES } from '@/shared/utils/thumbnail-url';
import './WatchEpisodeCard.scss';

interface WatchEpisodeCardProps {
  item: EpisodesTypes;
  posterUrl: string;
  episodePreviewUrl?: string | null;
  seriesTitle: string;
  languages: WatchPlaybackLanguages;
  episodeDuration: string | null;
  isActive: boolean;
  isWatched: boolean;
  progressRatio?: number;
  nowPlaying?: boolean;
  onSelect: () => void;
}

export function WatchEpisodeCard({
  item,
  posterUrl,
  episodePreviewUrl,
  seriesTitle,
  languages,
  episodeDuration,
  isActive,
  isWatched,
  progressRatio = 0,
  nowPlaying = false,
  onSelect,
}: WatchEpisodeCardProps) {
  const { t } = useTranslation('common');
  const epLabel = `E${item.episode_no}`;
  const title = formatEpisodeCardTitle(seriesTitle, item.episode_no, item.title);
  const languageLine = formatEpisodeLangLine(languages, t);
  const isFiller = item.filler === true;
  const remoteThumbSrc = thumbnailUrl(posterUrl, LIST_THUMBNAIL_RES);
  const thumbSrc = episodePreviewUrl ?? remoteThumbSrc;
  const isBlobPreview = Boolean(episodePreviewUrl);
  const objectPosition = isBlobPreview
    ? undefined
    : episodeThumbObjectPosition(item.episode_no);

  return (
    <button
      type="button"
      className={`watch-episode-card${isActive ? ' watch-episode-card--active' : ''}${isWatched ? ' watch-episode-card--watched' : ''}${nowPlaying ? ' watch-episode-card--now-playing' : ''}${isFiller ? ' watch-episode-card--filler' : ''}`}
      aria-label={`${title}${seriesTitle ? `, ${seriesTitle}` : ''}`}
      onClick={onSelect}
    >
      <div className="watch-episode-card__thumb">
        {thumbSrc ? (
          isBlobPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob URL from IndexedDB
            <img
              src={thumbSrc}
              alt=""
              className="watch-episode-card__img watch-episode-card__img--cover"
              style={objectPosition ? { objectPosition } : undefined}
            />
          ) : (
            <Image
              src={thumbSrc}
              alt=""
              fill
              loading="lazy"
              sizes="(max-width: 640px) 45vw, (max-width: 1200px) 22vw, 280px"
              quality={WATCH_EPISODE_THUMB_QUALITY}
              className="watch-episode-card__img"
              style={objectPosition ? { objectPosition } : undefined}
            />
          )
        ) : null}
        {!isBlobPreview ? (
          <span className="watch-episode-card__ep-badge">{epLabel}</span>
        ) : null}
        <span className="watch-episode-card__play" aria-hidden>
          <Play className="h-8 w-8 fill-white text-white" />
        </span>
        {episodeDuration ? (
          <span className="watch-episode-card__duration">{episodeDuration}</span>
        ) : null}
        {progressRatio > 0 ? (
          <div
            className="watch-episode-card__progress"
            style={{ width: `${progressRatio * 100}%` }}
            aria-hidden
          />
        ) : null}
        {isFiller ? (
          <span className="watch-episode-card__filler-badge" title={t('watch.fillerTitle')}>
            {t('watch.filler')}
          </span>
        ) : null}
        {nowPlaying ? (
          <span className="watch-episode-card__now-playing">{t('watch.nowPlaying')}</span>
        ) : null}
        {isWatched && !nowPlaying && progressRatio <= 0 ? (
          <div
            className="watch-episode-card__progress watch-episode-card__progress--watched"
            aria-hidden
          />
        ) : null}
      </div>
      <div className="watch-episode-card__body">
        <p className="watch-episode-card__title">{title}</p>
        {languageLine ? <p className="watch-episode-card__langs">{languageLine}</p> : null}
      </div>
    </button>
  );
}
