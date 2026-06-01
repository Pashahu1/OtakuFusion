'use client';

import Link from 'next/link';
import Image from 'next/image';
import { thumbnailUrl, LIST_THUMBNAIL_RES } from '@/shared/utils/thumbnail-url';
import { truncateText } from '@/shared/utils/truncate-text';
import { Bookmark, Play, Star } from 'lucide-react';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { cn } from '@/lib/utils';
import { FavoriteBookmark } from '@/components/Card/FavoriteBookmark';
import { useIsFavoriteAnime } from '@/hooks/useFavorites';
import { getStreamAvailabilityLabel } from '@/shared/utils/streamAvailabilityLabel';

interface CardProps {
  anime: AnimeInfo;
  posterSizes?: string;
  posterQuality?: number;
  priority?: boolean;
  posterEager?: boolean;
}

const iconRow =
  'h-[24px] w-[24px] shrink-0 stroke-[var(--color-brand-orange)] text-[var(--color-brand-orange)]';

const DEFAULT_POSTER_SIZES =
  '(min-width: 1280px) min(13vw, 320px), (min-width: 1024px) min(17vw, 320px), (min-width: 768px) min(25vw, 280px), (min-width: 640px) min(33vw, 260px), min(50vw, 240px)';

function splitTenPointRating(rating: string): { score: string; outOfTen?: string } {
  const trimmed = rating.trim();
  const m = trimmed.match(/^(\d+(?:\.\d+)?)\s*\/\s*10$/i);
  if (m) return { score: m[1], outOfTen: '/10' };
  return { score: trimmed };
}

/** Second line under title: AniList metadata when catalog counters (has_sub / has_dub) are not yet available. */
function buildCardFooterFallbackLine(
  tv: AnimeInfo['tvInfo']
): string | null {
  if (!tv) return null;
  const epRaw =
    typeof tv.episodeTotal === 'string' ? tv.episodeTotal.trim() : '';
  const hasEpisodeTotal = /^\d+(\.\d+)?$/.test(epRaw);
  const parts: string[] = [];
  const showT = tv.showType?.trim();
  if (showT) parts.push(showT);
  if (hasEpisodeTotal) {
    parts.push(`${Number(epRaw).toLocaleString()} Episodes`);
  }
  const dur = tv.duration?.trim();
  if (dur) parts.push(dur);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function Card({
  anime,
  posterSizes = DEFAULT_POSTER_SIZES,
  posterQuality = 75,
  priority = false,
  posterEager = false,
}: CardProps) {
  const tv = anime.tvInfo;
  const episodeCountRaw =
    typeof tv?.episodeTotal === 'string' ? tv.episodeTotal.trim() : '';
  const looksLikeEpisodeCount = /^\d+(\.\d+)?$/.test(episodeCountRaw);
  const streamLabel = getStreamAvailabilityLabel(tv);
  const underTitleSecondary =
    streamLabel ?? buildCardFooterFallbackLine(tv);

  const hasMetaBlock =
    Boolean(tv?.showType) ||
    looksLikeEpisodeCount ||
    Boolean(tv?.duration);

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
            src={
              anime.poster
                ? thumbnailUrl(anime.poster, LIST_THUMBNAIL_RES)
                : '/sukuna-error.jpg'
            }
            alt=""
            fill
            quality={posterQuality}
            priority={priority}
            fetchPriority={priority ? 'high' : undefined}
            loading={
              priority ? undefined : posterEager ? 'eager' : undefined
            }
            className="object-cover object-center transition-[filter] duration-300 ease-out group-hover/card:saturate-[0.78] group-focus-within/card:saturate-[0.78]"
            sizes={posterSizes}
            aria-hidden
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

          <div
            className="pointer-events-none absolute inset-0 z-10 flex min-h-0 flex-col px-4 pt-4 pb-4 text-left opacity-0 transition-opacity duration-300 ease-out group-focus-within/card:opacity-100 group-hover/card:opacity-100"
          >
            <div className="shrink-0 space-y-2">
              <p className="line-clamp-2 text-[15px] leading-snug font-bold tracking-tight text-white sm:text-base">
                {anime.title}
              </p>

              {ratingParts ? (
                <p className="flex flex-wrap items-center gap-1.5 text-[12px] font-medium tabular-nums text-zinc-400 sm:text-[13px]">
                  <span className="text-zinc-200">{ratingParts.score}</span>
                  {ratingParts.outOfTen ? (
                    <span className="font-normal text-zinc-500">{ratingParts.outOfTen}</span>
                  ) : null}
                  <Star
                    className="h-2.5 w-2.5 shrink-0 fill-zinc-400 text-zinc-500"
                    strokeWidth={0}
                    aria-hidden
                  />
                </p>
              ) : null}

              {hasMetaBlock ? (
                <div className="flex flex-col gap-y-0.5 text-[11px] leading-snug font-normal text-zinc-400 sm:text-xs">
                  {metaLinePrimary ? <p>{metaLinePrimary}</p> : null}
                  {metaLineSecondary &&
                  metaLineSecondary !== metaLinePrimary ? (
                    <p className="tabular-nums">{metaLineSecondary}</p>
                  ) : null}
                  {anime.adultContent ? (
                    <p className="text-[10px] font-semibold tracking-widest text-amber-400/95">
                      +18
                    </p>
                  ) : null}
                </div>
              ) : anime.adultContent ? (
                <p className="text-[10px] font-semibold tracking-widest text-amber-400/95">
                  +18
                </p>
              ) : null}
            </div>

            {anime.description ? (
              <p className="mt-3 line-clamp-4 min-h-0 flex-1 text-pretty text-[11px] leading-relaxed font-normal text-zinc-100 sm:line-clamp-5 sm:text-xs">
                {truncateText(anime.description, 280)}
              </p>
            ) : (
              <div className="min-h-0 flex-1" aria-hidden />
            )}

            <div className="relative z-20 mt-auto flex shrink-0 justify-start gap-6 pt-3">
              <Play
                className={iconRow}
                strokeWidth={2}
                fill="none"
                aria-hidden
              />
              <FavoriteBookmark anime={anime} iconClassName={iconRow} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
