'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Convertor } from '@/helper/Convertor';
import { truncateText } from '@/helper/truncateText';
import {
  Play,
  BookmarkPlus,
  Plus,
  Star,
  Tv,
  List,
  Clock,
} from 'lucide-react';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { cn } from '@/lib/utils';

interface CardProps {
  anime: AnimeInfo;
}

const iconRow =
  'h-6 w-6 shrink-0 stroke-[var(--color-brand-orange)] text-[var(--color-brand-orange)] sm:h-7 sm:w-7';

const metaIconClass =
  'h-2.5 w-2.5 shrink-0 text-zinc-200 sm:h-3 sm:w-3';

export function Card({ anime }: CardProps) {
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
      className="group/card block w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand-orange)]"
    >
      <article
        className="relative flex w-full flex-col overflow-hidden rounded-lg focus-within:z-10 hover:z-10"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <div className="relative z-10 flex w-full flex-col">
          <div className="aspect-[2/3] w-full shrink-0" aria-hidden />
          <div
            className="flex min-h-[3.25rem] w-full min-w-0 flex-col gap-0.5 px-2 py-2 transition-opacity duration-300 group-hover/card:pointer-events-none group-hover/card:opacity-0 group-focus-within/card:pointer-events-none group-focus-within/card:opacity-0"
          >
            <h3
              className="line-clamp-2 font-semibold leading-tight text-white"
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
            'absolute left-0 right-0 top-0 z-0 overflow-hidden rounded-t-lg',
            'aspect-[2/3] w-full max-w-full',
            'transition-[inset,top,right,bottom,left,border-radius,height] duration-300 ease-out',
            'group-hover/card:inset-0 group-hover/card:aspect-auto group-hover/card:h-full group-hover/card:rounded-lg',
            'group-focus-within/card:inset-0 group-focus-within/card:aspect-auto group-focus-within/card:h-full group-focus-within/card:rounded-lg',
          )}
        >
          <Image
            src={anime.poster ? Convertor(anime.poster) : '/sukuna-error.jpg'}
            alt=""
            fill
            quality={70}
            className="object-cover object-center"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            aria-hidden
          />

          <div
            className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/58 via-black/62 to-black/84 opacity-0 transition-opacity duration-300 ease-out group-hover/card:opacity-100 group-focus-within/card:opacity-100"
            aria-hidden
          />

          <div
            className="pointer-events-none absolute inset-0 z-10 flex flex-col px-3.5 pb-3 pt-3.5 text-left opacity-0 transition-opacity duration-300 ease-out group-hover/card:opacity-100 group-focus-within/card:opacity-100 sm:px-4 sm:pb-3.5 sm:pt-4"
            aria-hidden
          >
            <div className="shrink-0 space-y-1.5">
              <h3 className="line-clamp-2 text-[16px] font-semibold uppercase leading-[1.2] tracking-[0.04em] text-white">
                {anime.title}
              </h3>

              {tv?.rating ? (
                <p className="flex flex-wrap items-center gap-1 text-[9px] font-normal tabular-nums text-zinc-400 sm:text-[10px]">
                  <span>{tv.rating}</span>
                  <Star
                    className="h-2 w-2 shrink-0 fill-zinc-300 text-zinc-300"
                    strokeWidth={0}
                    aria-hidden
                  />
                </p>
              ) : null}

              {hasMetaBlock ? (
                <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-normal leading-snug sm:text-[10px]">
                  {tv?.showType ? (
                    <span className="inline-flex items-center gap-1.5 text-zinc-300">
                      <Tv
                        className={metaIconClass}
                        strokeWidth={2}
                        aria-hidden
                      />
                      {tv.showType}
                    </span>
                  ) : null}
                  {looksLikeEpisodeCount ? (
                    <span className="inline-flex items-center gap-1.5 tabular-nums text-zinc-300">
                      <List
                        className={metaIconClass}
                        strokeWidth={2}
                        aria-hidden
                      />
                      {Number(episodeCountRaw).toLocaleString()} Episodes
                    </span>
                  ) : null}
                  {tv?.duration ? (
                    <span className="inline-flex items-center gap-1.5 text-zinc-300">
                      <Clock
                        className={metaIconClass}
                        strokeWidth={2}
                        aria-hidden
                      />
                      {tv.duration}
                    </span>
                  ) : null}
                  {tv?.quality ? (
                    <span className="text-zinc-400">{tv.quality}</span>
                  ) : null}
                </div>
              ) : null}
            </div>

            {anime.adultContent ? (
              <p className="mt-1.5 shrink-0 text-[9px] font-medium uppercase tracking-widest text-amber-300/90 sm:text-[10px]">
                +18
              </p>
            ) : null}

            {anime.description ? (
              <p className="mt-2 min-h-0 flex-1 text-pretty text-[9px] font-normal leading-[1.4] text-white/90 sm:text-[10px] line-clamp-3 sm:line-clamp-4">
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
              <Plus className={iconRow} strokeWidth={2} fill="none" aria-hidden />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
