import { Play, Star } from 'lucide-react';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { truncateText } from '@/shared/utils/truncate-text';
import { FavoriteBookmark } from '@/components/Card/FavoriteBookmark';
import { splitTenPointRating } from './card-meta';

const iconRow =
  'h-[24px] w-[24px] shrink-0 stroke-[var(--color-brand-orange)] text-[var(--color-brand-orange)]';

interface CardHoverPanelProps {
  anime: AnimeInfo;
  ratingParts: ReturnType<typeof splitTenPointRating> | null;
  metaLinePrimary: string;
  metaLineSecondary: string;
  hasMetaBlock: boolean;
}

export function CardHoverPanel({
  anime,
  ratingParts,
  metaLinePrimary,
  metaLineSecondary,
  hasMetaBlock,
}: CardHoverPanelProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex min-h-0 flex-col px-4 pt-4 pb-4 text-left opacity-0 transition-opacity duration-300 ease-out group-focus-within/card:opacity-100 group-hover/card:opacity-100">
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
            {metaLineSecondary && metaLineSecondary !== metaLinePrimary ? (
              <p className="tabular-nums">{metaLineSecondary}</p>
            ) : null}
            {anime.adultContent ? (
              <p className="text-[10px] font-semibold tracking-widest text-amber-400/95">+18</p>
            ) : null}
          </div>
        ) : anime.adultContent ? (
          <p className="text-[10px] font-semibold tracking-widest text-amber-400/95">+18</p>
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
        <Play className={iconRow} strokeWidth={2} fill="none" aria-hidden />
        <FavoriteBookmark anime={anime} iconClassName={iconRow} />
      </div>
    </div>
  );
}
