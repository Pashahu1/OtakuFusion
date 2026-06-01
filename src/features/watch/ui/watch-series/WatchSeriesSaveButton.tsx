'use client';

import { FavoriteBookmark } from '@/components/Card/FavoriteBookmark';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import './WatchSeriesSaveButton.scss';

interface WatchSeriesSaveButtonProps {
  anime: AnimeInfo;
}

/** Crunchyroll-style square “Save” control beside the primary CTA. */
export function WatchSeriesSaveButton({ anime }: WatchSeriesSaveButtonProps) {
  return (
    <FavoriteBookmark
      anime={anime}
      variant="square"
      buttonClassName="watch-series-save"
      iconClassName="watch-series-save__icon"
    />
  );
}
