'use client';

import { useTranslation } from 'react-i18next';

import { ANIME_SEARCH_MIN_QUERY_LENGTH } from '@/lib/api/anime-search';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { Card } from '@/components/Card/Card';
import {
  ANIME_CAROUSEL_POSTER_SIZES,
  ABOVE_THE_FOLD_CARD_COUNT,
  ANIME_GRID_POSTER_QUALITY,
} from '@/lib/anime-card-poster';
import { SearchSkeleton } from '@/components/ui/Skeleton/SearchSkeleton';
import type { AnimeSearchItems } from '@/shared/types/AnimeSearchTypes';
import { SearchGenreChips, SearchLanding } from './SearchLanding';
import { SearchStatus } from './SearchStatus';

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
  const { t } = useTranslation('common');
  const trimmed = keyword.trim();

  if (!trimmed) {
    return <SearchLanding />;
  }

  if (trimmed.length < ANIME_SEARCH_MIN_QUERY_LENGTH) {
    return (
      <SearchStatus
        title={t('search.keepTyping')}
        message={t('search.minChars', { count: ANIME_SEARCH_MIN_QUERY_LENGTH })}
      />
    );
  }

  if (isPending && !results) {
    return <SearchSkeleton />;
  }

  if (isError && !results) {
    return (
      <SearchStatus
        title={t('search.unavailable')}
        message={t('search.unavailableHint')}
      />
    );
  }

  if (!results || results.length === 0) {
    if (isTyping || isFetching) {
      return <SearchSkeleton />;
    }

    return (
      <div className="search-page__status-wrap">
        <SearchStatus
          title={t('search.noMatches')}
          message={t('search.noMatchesHint', { query: trimmed })}
        />
        <SearchGenreChips />
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
