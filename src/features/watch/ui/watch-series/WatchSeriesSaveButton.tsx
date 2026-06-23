'use client';

import { FavoriteBookmark } from '@/components/Card/FavoriteBookmark';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import './WatchSeriesSaveButton.scss';

interface WatchSeriesSaveButtonProps {
  anime: AnimeInfo;
  /** `hero` — bordered square on series page; `ghost` — borderless icon on play page. */
  appearance?: 'hero' | 'ghost';
}

/** Crunchyroll-style save control beside series title / hero CTA. */
export function WatchSeriesSaveButton({
  anime,
  appearance = 'hero',
}: WatchSeriesSaveButtonProps) {
  const isGhost = appearance === 'ghost';

  return (
    <FavoriteBookmark
      anime={anime}
      variant="square"
      buttonClassName={isGhost ? 'watch-play-save' : 'watch-series-save'}
      iconClassName={isGhost ? 'watch-play-save__icon' : 'watch-series-save__icon'}
    />
  );
}
