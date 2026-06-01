'use client';

import { ANIME_SEARCH_MIN_QUERY_LENGTH } from '@/lib/api/anime-search';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { Card } from '@/components/Card/Card';
import {
  ANIME_CAROUSEL_POSTER_SIZES,
  ABOVE_THE_FOLD_CARD_COUNT,
  ANIME_GRID_POSTER_QUALITY,
} from '@/lib/anime-card-poster';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { SearchSkeleton } from '@/components/ui/Skeleton/SearchSkeleton';
import type { AnimeSearchItems } from '@/shared/types/AnimeSearchTypes';

interface SearchDataProps {
  keyword: string;
  results: AnimeSearchItems[] | undefined;
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  isTyping?: boolean;
}

export function SearchData({
  keyword,
  results,
  isPending,
  isError,
  isFetching,
  isTyping = false,
}: SearchDataProps) {
  const trimmed = keyword.trim();

  if (!trimmed) {
    return (
      <EmptyState
        plain
        message="Start typing an anime title — suggestions appear as you type."
      />
    );
  }

  if (trimmed.length < ANIME_SEARCH_MIN_QUERY_LENGTH) {
    return (
      <EmptyState
        plain
        message={`Enter at least ${ANIME_SEARCH_MIN_QUERY_LENGTH} characters to search.`}
      />
    );
  }

  if (isPending && !results) {
    return <SearchSkeleton />;
  }

  if (isError && !results) {
    return (
      <div className="px-4 py-8 sm:p-10">
        <EmptyState plain message="Search service is temporarily unavailable." />
      </div>
    );
  }

  if (!results || results.length === 0) {
    if (isTyping || isFetching) {
      return <SearchSkeleton />;
    }

    return (
      <div className="col-span-full text-center">
        <EmptyState plain message="No results found." />
      </div>
    );
  }

  return (
    <div
      className={
        isTyping || isFetching ? 'opacity-80 transition-opacity' : undefined
      }
    >
      <AnimeListLayout>
        {results.map((anime: AnimeSearchItems, idx: number) => (
          <Card
            key={anime.id || idx}
            anime={anime}
            posterSizes={ANIME_CAROUSEL_POSTER_SIZES}
            posterQuality={ANIME_GRID_POSTER_QUALITY}
            priority={idx < ABOVE_THE_FOLD_CARD_COUNT}
          />
        ))}
      </AnimeListLayout>
    </div>
  );
}
