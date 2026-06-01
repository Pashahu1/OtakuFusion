'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/Card/Card';
import type { GenreBrowseResult } from '@/lib/api/genre-hub';
import type { GenreMediaFilter } from '@/shared/data/genre-hub';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { loadGenreBrowsePage } from '@/app/anime/category/[gender]/browse/[section]/actions';
import {
  ABOVE_THE_FOLD_CARD_COUNT,
  ANIME_GRID_POSTER_QUALITY,
} from '@/lib/anime-card-poster';

interface GenreBrowseLoadMoreProps {
  genre: string;
  sectionId: string;
  media: GenreMediaFilter;
  initialItems: AnimeInfo[];
  initialPage: number;
  hasNextPage: boolean;
}

export function GenreBrowseLoadMore({
  genre,
  sectionId,
  media,
  initialItems,
  initialPage,
  hasNextPage: initialHasNext,
}: GenreBrowseLoadMoreProps) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialPage);
  const [hasNextPage, setHasNextPage] = useState(initialHasNext);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      const nextPage = page + 1;
      const result: GenreBrowseResult | null = await loadGenreBrowsePage({
        genre,
        sectionId,
        media,
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
            className="rounded-md border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition-colors hover:border-brand-orange/50 hover:bg-white/10 disabled:opacity-50"
          >
            {isPending ? 'Loading…' : 'Load more'}
          </button>
        </div>
      ) : null}
    </>
  );
}
