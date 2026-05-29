'use client';

import { ANIME_SEARCH_MIN_QUERY_LENGTH } from '@/lib/api/anime-search';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { Card } from '@/components/Card/Card';
import {
  ANIME_CAROUSEL_POSTER_QUALITY,
  ANIME_CAROUSEL_POSTER_SIZES,
} from '@/lib/anime-card-poster';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { SearchSkeleton } from '@/components/ui/Skeleton/SearchSkeleton';
import { useAnimeSearchQuery } from '@/hooks/queries';
import type { AnimeSearchItems } from '@/shared/types/AnimeSearchTypes';

export function SearchData({ keyword }: { keyword: string }) {
  const trimmed = keyword.trim();

  if (!trimmed) {
    return <EmptyState message="Please enter Anime name." />;
  }

  if (trimmed.length < ANIME_SEARCH_MIN_QUERY_LENGTH) {
    return (
      <EmptyState
        message={`Enter at least ${ANIME_SEARCH_MIN_QUERY_LENGTH} characters to search.`}
      />
    );
  }

  return <SearchResults keyword={trimmed} />;
}

function SearchResults({ keyword }: { keyword: string }) {
  const { data: results, isPending, isError, isFetching } = useAnimeSearchQuery(keyword);

  if (isPending && !results) {
    return <SearchSkeleton />;
  }

  if (isError && !results) {
    return (
      <div className="px-4 py-8 sm:p-10">
        <EmptyState message="Search service is temporarily unavailable." />
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="col-span-full text-center">
        <EmptyState message="No results found." />
      </div>
    );
  }

  return (
    <div className={isFetching ? 'opacity-80 transition-opacity' : undefined}>
      <AnimeListLayout>
        {results.map((anime: AnimeSearchItems, idx: number) => (
          <Card
            key={anime.id || idx}
            anime={anime}
            posterSizes={ANIME_CAROUSEL_POSTER_SIZES}
            posterQuality={ANIME_CAROUSEL_POSTER_QUALITY}
          />
        ))}
      </AnimeListLayout>
    </div>
  );
}
