'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Convertor } from '@/helper/Convertor';
import { truncateText } from '@/helper/truncateText';
import { Play, BookmarkPlus, Plus, Star, Tv, List, Clock } from 'lucide-react';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { cn } from '@/lib/utils';

interface CardProps {
  anime: AnimeInfo;
  /** Для `sizes` у next/image: у каруселі (SwiperCard) ширина `clamp(140px, 22vw, 310px)`, не 50vw — інакше зайві ~100–150 KiB на ряд. */
  posterSizes?: string;
  /** У рядку каруселі можна нижче за сітку (менший файл, Lighthouse). */
  posterQuality?: number;
}

const iconRow =
  'h-6 w-6 shrink-0 stroke-[var(--color-brand-orange)] text-[var(--color-brand-orange)] sm:h-7 sm:w-7';

const metaIconClass = 'h-2.5 w-2.5 shrink-0 text-zinc-200 sm:h-3 sm:w-3';

/** Узгоджено з сіткою AnimeListLayout / AnimeSection: 2 / 3 / 4 / 6 / 8 колонок. */
const DEFAULT_POSTER_SIZES =
  '(min-width: 1280px) 13vw, (min-width: 1024px) 17vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw';

export function Card({
  anime,
  posterSizes = DEFAULT_POSTER_SIZES,
  posterQuality = 65,
}: CardProps) {
  const tv = anime.tvInfo;
  const episodeCountRaw = tv?.sub?.trim() ?? '';
  const looksLikeEpisodeCount = /^\d+(\.\d+)?$/.test(episodeCountRaw);

  const hasMetaBlock =
    Boolean(tv?.showType) ||
    looksLikeEpisodeCount ||
    Boolean(tv?.duration) ||
    Boolean(tv?.quality);

  return (
    <Link
      href={`/watch/${anime.id}`}
      className="group/card block w-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)] focus-visible:ring-inset"
    >
      <article
        className="relative flex w-full flex-col overflow-hidden focus-within:z-10 hover:z-10"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <div className="relative z-10 flex w-full flex-col">
          <div className="aspect-[2/3] w-full shrink-0" aria-hidden />
          <div className="flex min-h-[3.25rem] w-full min-w-0 flex-col gap-0.5 px-2 py-2 transition-opacity duration-300 group-focus-within/card:pointer-events-none group-focus-within/card:opacity-0 group-hover/card:pointer-events-none group-hover/card:opacity-0">
            <h3
              className="line-clamp-2 leading-tight font-semibold text-white"
              style={{ fontSize: 'var(--text-card-title)' }}
            >
              {anime.title}
            </h3>
            <p
              className="leading-tight text-[var(--color-brand-text-muted)]"
              style={{ fontSize: 'var(--text-card-label)' }}
            >
              {tv?.sub && tv?.dub && 'Sub | Dub'}
              {tv?.sub && !tv?.dub && 'Sub'}
              {!tv?.sub && tv?.dub && 'Dub'}
            </p>
          </div>
        </div>

        <div
          className={cn(
            'absolute top-0 right-0 left-0 z-0 overflow-hidden',
            'aspect-[2/3] w-full max-w-full',
            'transition-[inset,top,right,bottom,left,border-radius,height] duration-300 ease-out',
            'group-hover/card:inset-0 group-hover/card:aspect-auto group-hover/card:h-full',
            'group-focus-within/card:inset-0 group-focus-within/card:aspect-auto group-focus-within/card:h-full'
          )}
        >
          <Image
            src={anime.poster ? Convertor(anime.poster) : '/sukuna-error.jpg'}
            alt=""
            fill
            quality={posterQuality}
            className="object-cover object-center"
            sizes={posterSizes}
            aria-hidden
          />

          <div
            className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/58 via-black/62 to-black/84 opacity-0 transition-opacity duration-300 ease-out group-focus-within/card:opacity-100 group-hover/card:opacity-100"
            aria-hidden
          />

          <div
            className="flex gap-y-1.5 pointer-events-none absolute inset-0 z-10 flex flex-col px-3.5 pt-3.5 pb-3 text-left opacity-0 transition-opacity duration-300 ease-out group-focus-within/card:opacity-100 group-hover/card:opacity-100 sm:px-4 sm:pt-4 sm:pb-3.5"
            aria-hidden
          >
            <div className="flex flex-col gap-y-1.5">
              <h3 className="line-clamp-2 text-[16px] leading-[1.2] font-semibold tracking-[0.04em] text-white uppercase">
                {anime.title}
              </h3>

              {tv?.rating ? (
                <p className="flex flex-wrap items-center gap-1 text-[9px] font-normal text-zinc-400 tabular-nums sm:text-[10px]">
                  <span>{tv.rating}</span>
                  <Star
                    className="h-2 w-2 shrink-0 fill-zinc-300 text-zinc-300"
                    strokeWidth={3}
                    aria-hidden
                  />
                </p>
              ) : null}

              {hasMetaBlock ? (
                <div className="flex flex-col gap-y-0.5 leading-snug font-normal sm:text-[10px]">
                  {tv?.showType ? (
                    <span className="inline-flex items-center gap-1.5 text-zinc-300 text-[14px]">
                      <Tv
                        className={metaIconClass}
                        strokeWidth={3}
                        aria-hidden
                      />
                      {tv.showType}
                    </span>
                  ) : null}
                  {looksLikeEpisodeCount ? (
                    <span className="inline-flex items-center gap-1.5 text-zinc-300 tabular-nums text-[14px]">
                      <List
                        className={metaIconClass}
                        strokeWidth={3}
                        aria-hidden
                      />
                      {Number(episodeCountRaw).toLocaleString()} Episodes
                    </span>
                  ) : null}
                  {tv?.duration ? (
                    <span className="inline-flex items-center gap-1.5 text-zinc-300 text-[14px]">
                      <Clock
                        className={metaIconClass}
                        strokeWidth={3}
                        aria-hidden
                      />
                      {tv.duration}
                    </span>
                  ) : null}
                  {tv?.quality ? (
                    <span className="text-zinc-400 ">{tv.quality}</span>
                  ) : null}
                  {anime.adultContent ? (
                    <p className="mt-1.5 shrink-0 text-[14px] font-medium tracking-widest">
                      +18
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {anime.description ? (
              <p className="mt-2 line-clamp-3 min-h-0 flex-1 text-[9px] leading-[1.4] font-normal text-pretty text-white/90 sm:line-clamp-4 sm:text-[6px]">
                {truncateText(anime.description)}
              </p>
            ) : (
              <div className="min-h-0 flex-1" aria-hidden />
            )}

            <div className="mt-auto flex justify-start gap-4 pt-3">
              <Play
                className={iconRow}
                strokeWidth={2}
                fill="none"
                aria-hidden
              />
              <BookmarkPlus
                className={iconRow}
                strokeWidth={2}
                fill="none"
                aria-hidden
              />
              <Plus
                className={iconRow}
                strokeWidth={2}
                fill="none"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
