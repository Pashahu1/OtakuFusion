'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback } from 'react';
import { Convertor } from '@/helper/Convertor';
import { truncateText } from '@/helper/truncateText';
import { Play, BookmarkPlus, Plus } from 'lucide-react';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

interface CardProps {
  anime: AnimeInfo;
}

export function Card({ anime }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <Link
      href={`/watch/${anime.id}`}
      className="block w-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-gray)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      <article
        className="group relative flex w-full flex-col overflow-hidden transition-[transform] duration-300 ease-out focus-within:z-10 hover:z-10"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <Image
            src={anime.poster ? Convertor(anime.poster) : '/sukuna-error.jpg'}
            alt={anime.title}
            fill
            quality={70}
            className="object-cover object-center transition duration-300 group-hover:brightness-[0.85]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
          />

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
            aria-hidden
          />
        </div>

        <div
          className="flex w-full min-w-0 flex-col gap-1 rounded-b-md px-3 py-2.5 transition-opacity duration-200"
          style={{ opacity: isHovered ? 0 : 1 }}
        >
          <h3
            className="line-clamp-2 leading-[var(--text-card-title--line-height)] font-medium text-white"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-card-title)',
            }}
          >
            {anime.title}
          </h3>
          <p
            className="leading-[var(--text-card-label--line-height)] font-normal text-[var(--color-brand-text-muted)]"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-card-label)',
            }}
          >
            {anime.tvInfo?.sub && anime.tvInfo?.dub && 'Sub | Dub'}
            {anime.tvInfo?.sub && !anime.tvInfo?.dub && 'Sub'}
            {!anime.tvInfo?.sub && anime.tvInfo?.dub && 'Dub'}
          </p>
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-[2] flex flex-col bg-gradient-to-b from-black/90 from-0% via-black/85 via-40% to-black/75 to-100% p-4 text-left transition-opacity duration-200"
          style={{ opacity: isHovered ? 1 : 0 }}
          aria-hidden
        >
          <h3
            className="mb-2 line-clamp-2 leading-tight font-bold text-white"
            style={{ fontSize: 'var(--text-card-hover-title)' }}
          >
            {anime.title}
          </h3>
          <div className="flex items-center gap-2">
            {anime.tvInfo?.sub && (
              <p
                className="mb-1 font-bold text-white/80"
                style={{ fontSize: 'var(--text-card-hover-meta)' }}
              >
                {anime.tvInfo.sub} Episodes
              </p>
            )}

            {anime.tvInfo?.quality && (
              <p
                className="mb-1 font-bold text-white/80"
                style={{ fontSize: 'var(--text-card-hover-meta)' }}
              >
                {anime.tvInfo.quality}
              </p>
            )}

            {(anime.tvInfo?.showType || anime.tvInfo?.duration) && (
              <>
                <span className="text-white/80">•</span>
                <p
                  className="mb-2 text-white/80"
                  style={{ fontSize: 'var(--text-card-hover-meta)' }}
                >
                  {[anime.tvInfo.showType, anime.tvInfo.duration]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              </>
            )}

            {anime.adultContent && (
              <>
                <span className="text-white/80">•</span>
                <p
                  className="mb-1 font-bold text-white"
                  style={{ fontSize: 'var(--text-card-hover-meta)' }}
                >
                  +18
                </p>
              </>
            )}
          </div>

          {anime.description && (
            <p
              className="mb-4 line-clamp-4 min-h-0 flex-1 leading-[1.5] text-white/90"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-card-hover-desc)',
              }}
            >
              {truncateText(anime.description)}
            </p>
          )}

          <div className="mt-auto flex items-center gap-3 pt-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-orange)] text-white shadow-lg">
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/60 bg-white/5 text-white">
              <BookmarkPlus className="h-4 w-4" />
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/60 bg-white/5 text-white">
              <Plus className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
