'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { thumbnailUrl, LIST_THUMBNAIL_RES } from '@/shared/utils/thumbnail-url';
import { Bookmark } from 'lucide-react';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { cn } from '@/lib/utils';
import { useIsFavoriteAnime } from '@/hooks/useFavorites';
import { getStreamAvailabilityLabel } from '@/shared/utils/streamAvailabilityLabel';
import { buildCardFooterFallbackLine, splitTenPointRating } from './card-meta';
import { CardHoverPanel } from './CardHoverPanel';

interface CardProps {
  anime: AnimeInfo;
  posterSizes?: string;
  posterQuality?: number;
  priority?: boolean;
  posterEager?: boolean;
}

const DEFAULT_POSTER_SIZES =
  '(min-width: 1280px) min(13vw, 320px), (min-width: 1024px) min(17vw, 320px), (min-width: 768px) min(25vw, 280px), (min-width: 640px) min(33vw, 260px), min(50vw, 240px)';

export function Card({
  anime,
  posterSizes = DEFAULT_POSTER_SIZES,
  posterQuality = 75,
  priority = false,
  posterEager = false,
}: CardProps) {
  const fallbackPosterSrc =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='900' viewBox='0 0 600 900'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23111827'/%3E%3Cstop offset='55%25' stop-color='%230b1220'/%3E%3Cstop offset='100%25' stop-color='%2303070d'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='900' fill='url(%23g)'/%3E%3Ccircle cx='300' cy='410' r='118' fill='none' stroke='%23334155' stroke-width='20'/%3E%3Cpath d='M165 700c33-92 102-137 135-137s102 45 135 137' fill='none' stroke='%23334155' stroke-width='20' stroke-linecap='round'/%3E%3C/svg%3E";
  const resolvedPosterSrc = useMemo(() => {
    if (!anime.poster) return fallbackPosterSrc;
    const src = thumbnailUrl(anime.poster, LIST_THUMBNAIL_RES).trim();
    return src || fallbackPosterSrc;
  }, [anime.poster]);
  const [posterSrc, setPosterSrc] = useState(resolvedPosterSrc);

  useEffect(() => {
    setPosterSrc(resolvedPosterSrc);
  }, [resolvedPosterSrc]);

  const tv = anime.tvInfo;
  const episodeCountRaw =
    typeof tv?.episodeTotal === 'string' ? tv.episodeTotal.trim() : '';
  const looksLikeEpisodeCount = /^\d+(\.\d+)?$/.test(episodeCountRaw);
  const streamLabel = getStreamAvailabilityLabel(tv);
  const underTitleSecondary = streamLabel ?? buildCardFooterFallbackLine(tv);

  const hasMetaBlock =
    Boolean(tv?.showType) || looksLikeEpisodeCount || Boolean(tv?.duration);

  const metaLinePrimary = tv?.showType?.trim() || '';
  const metaLineSecondary = looksLikeEpisodeCount
    ? `${Number(episodeCountRaw).toLocaleString()} Episodes`
    : tv?.duration?.trim() || '';

  const ratingParts = tv?.rating ? splitTenPointRating(tv.rating) : null;
  const isFavorite = useIsFavoriteAnime(anime.id);

  return (
    <article
      className="group/card relative flex min-w-0 max-w-full flex-col overflow-hidden focus-within:z-10 hover:z-10"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <Link
        prefetch
        href={`/watch/${anime.id}`}
        className="absolute inset-0 z-0 block outline-none focus-visible:z-[5] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)] focus-visible:ring-inset"
        aria-label={`Watch ${anime.title}`}
      >
        <span className="sr-only">Watch {anime.title}</span>
      </Link>

      <div className="relative z-10 w-full pointer-events-none">
        <div className="relative z-10 flex w-full flex-col">
          <div className="aspect-[2/3] w-full shrink-0" aria-hidden />
          <div
            className={cn(
              'flex min-h-[3.25rem] w-full min-w-0 flex-col gap-0.5 bg-black px-2 py-2 transition-opacity duration-300 group-focus-within/card:pointer-events-none group-focus-within/card:opacity-0 group-hover/card:pointer-events-none group-hover/card:opacity-0',
            )}
          >
            <p
              className="line-clamp-2 leading-tight font-semibold text-white"
              style={{ fontSize: 'var(--text-card-title)' }}
            >
              {anime.title}
            </p>
            {underTitleSecondary ? (
              <p
                className="leading-tight text-[var(--color-brand-text-muted)]"
                style={{ fontSize: 'var(--text-card-label)' }}
              >
                {underTitleSecondary}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className={cn(
            'absolute top-0 right-0 left-0 z-0 overflow-hidden',
            'aspect-[2/3] w-full max-w-full',
            'transition-[inset,top,right,bottom,left,border-radius,height,box-shadow] duration-300 ease-out',
            'group-hover/card:inset-0 group-hover/card:aspect-auto group-hover/card:h-full',
            'group-focus-within/card:inset-0 group-focus-within/card:aspect-auto group-focus-within/card:h-full',
          )}
        >
          <Image
            src={posterSrc}
            alt={`${anime.title} poster`}
            fill
            quality={posterQuality}
            priority={priority}
            fetchPriority={priority ? 'high' : undefined}
            loading={priority ? undefined : posterEager ? 'eager' : undefined}
            onError={() => setPosterSrc(fallbackPosterSrc)}
            className="object-cover object-center transition-[filter] duration-300 ease-out group-hover/card:saturate-[0.78] group-focus-within/card:saturate-[0.78]"
            sizes={posterSizes}
          />

          {isFavorite ? (
            <div
              className="pointer-events-none absolute top-0 right-0 z-[12] h-[52px] w-[52px]"
              aria-hidden
            >
              <div className="absolute right-0 top-0 h-0 w-0 border-l-[52px] border-t-[52px] border-l-transparent border-t-black" />
              <Bookmark
                className="absolute right-[7px] top-[9px] h-[15px] w-[15px] fill-[var(--color-brand-orange)]"
                strokeWidth={0}
              />
            </div>
          ) : null}

          <div
            className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/88 via-black/72 to-black/93 opacity-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.55)] transition-opacity duration-300 ease-out group-focus-within/card:opacity-100 group-hover/card:opacity-100"
            aria-hidden
          />

          <CardHoverPanel
            anime={anime}
            ratingParts={ratingParts}
            metaLinePrimary={metaLinePrimary}
            metaLineSecondary={metaLineSecondary}
            hasMetaBlock={hasMetaBlock}
          />
        </div>
      </div>
    </article>
  );
}
