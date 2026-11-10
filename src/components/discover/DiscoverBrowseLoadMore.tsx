'use client';

import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/Card/Card';
import { loadDiscoverBrowsePage } from '@/app/discover/[section]/actions';
import type { DiscoverBrowseResult } from '@/lib/api/discover';
import {
  ABOVE_THE_FOLD_CARD_COUNT,
  ANIME_GRID_POSTER_QUALITY,
} from '@/lib/anime-card-poster';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

interface DiscoverBrowseLoadMoreProps {
  sectionId: string;
  initialItems: AnimeInfo[];
  initialPage: number;
  hasNextPage: boolean;
}

export function DiscoverBrowseLoadMore({
  sectionId,
  initialItems,
  initialPage,
  hasNextPage: initialHasNext,
}: DiscoverBrowseLoadMoreProps) {
  const { t } = useTranslation('common');
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialPage);
  const [hasNextPage, setHasNextPage] = useState(initialHasNext);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      const nextPage = page + 1;
      const result: DiscoverBrowseResult | null = await loadDiscoverBrowsePage({
        sectionId,
        page: nextPage,
      });
      if (!result) return;
      setItems((prev) => {
        const seen = new Set(prev.map((a) => a.id));
        const merged = [...prev];
        for (const item of result.items) {
          if (!seen.has(item.id)) merged.push(item);
        }
        return merged;
      });
      setPage(result.page);
      setHasNextPage(result.hasNextPage);
    });
  }

  return (
    <>
      <div className="anime-card-feed">
        {items.map((anime, index) => (
          <Card
            key={anime.id}
            anime={anime}
            priority={index < ABOVE_THE_FOLD_CARD_COUNT}
            posterQuality={ANIME_GRID_POSTER_QUALITY}
          />
        ))}
      </div>

      {hasNextPage ? (
        <div className="genre-browse-layout__footer mt-10 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isPending}
            className="catalog-load-more"
          >
            {isPending ? t('actions.loading') : t('actions.loadMore')}
          </button>
        </div>
      ) : null}
    </>
  );
}
