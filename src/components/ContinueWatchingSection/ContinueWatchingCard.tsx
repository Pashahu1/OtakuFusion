'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';

import {
  continueWatchingEpisodeParam,
  continueWatchingProgressRatio,
  continueWatchingTimeLeftLabel,
} from '@/features/watch/lib/continue-watching-display';
import { useEpisodePreviewObjectUrl } from '@/features/watch/hooks/useEpisodePreviewObjectUrl';
import { setPendingPlaybackResume } from '@/features/watch/lib/playback-resume-pending';
import { watchPlayPath } from '@/shared/utils/watch-routes';
import { thumbnailUrl, LIST_THUMBNAIL_RES } from '@/shared/utils/thumbnail-url';
import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';

const FALLBACK_POSTER_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='900' viewBox='0 0 600 900'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23111827'/%3E%3Cstop offset='55%25' stop-color='%230b1220'/%3E%3Cstop offset='100%25' stop-color='%2303070d'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='900' fill='url(%23g)'/%3E%3Ccircle cx='300' cy='410' r='118' fill='none' stroke='%23334155' stroke-width='20'/%3E%3Cpath d='M165 700c33-92 102-137 135-137s102 45 135 137' fill='none' stroke='%23334155' stroke-width='20' stroke-linecap='round'/%3E%3C/svg%3E";

interface ContinueWatchingCardProps {
  item: ContinueWatchingEntry;
}

export function ContinueWatchingCard({ item }: ContinueWatchingCardProps) {
  const epParam = continueWatchingEpisodeParam(item);
  const progress = continueWatchingProgressRatio(item.positionSeconds, item.durationSeconds);
  const timeLeft = continueWatchingTimeLeftLabel(item.positionSeconds, item.durationSeconds);
  const previewUrl = useEpisodePreviewObjectUrl(item.id, epParam);
  const posterSrc = item.poster ? thumbnailUrl(item.poster, LIST_THUMBNAIL_RES) : FALLBACK_POSTER_SRC;
  const imageSrc = previewUrl ?? posterSrc;
  const isBlobPreview = Boolean(previewUrl);

  return (
    <Link
      href={watchPlayPath(item.id, epParam)}
      className="continue-watching-card group block"
      onClick={() => {
        if (item.positionSeconds == null || !Number.isFinite(item.positionSeconds)) return;
        setPendingPlaybackResume(
          item.id,
          epParam,
          item.positionSeconds,
          item.episodeNum,
        );
      }}
    >
      <article className="continue-watching-card__inner">
        <div className="continue-watching-card__thumb">
          {isBlobPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob URL from IndexedDB
            <img
              src={imageSrc}
              alt={item.title || item.japanese_title || 'Anime'}
              className="absolute inset-0 h-full w-full object-cover object-center transition duration-300 group-hover:brightness-110"
            />
          ) : (
            <Image
              src={imageSrc}
              alt={item.title || item.japanese_title || 'Anime'}
              fill
              quality={92}
              onError={(event) => {
                event.currentTarget.src = FALLBACK_POSTER_SRC;
              }}
              className="object-cover object-center transition duration-300 group-hover:brightness-110"
              sizes="(max-width: 640px) 200px, (max-width: 768px) 220px, 240px"
            />
          )}
          <div className="continue-watching-card__play" aria-hidden>
            <Play className="h-7 w-7 fill-white text-white" />
          </div>
          {progress > 0 ? (
            <div className="continue-watching-card__progress" style={{ width: `${progress * 100}%` }} />
          ) : null}
          {timeLeft ? <span className="continue-watching-card__time-left">{timeLeft}</span> : null}
          {item.adultContent ? <div className="continue-watching-card__adult">+18</div> : null}
        </div>
        <div className="continue-watching-card__meta">
          <p className="continue-watching-card__series">
            {item.title || item.japanese_title || 'Anime'}
          </p>
          <p className="continue-watching-card__episode">E{epParam}</p>
        </div>
      </article>
    </Link>
  );
}
