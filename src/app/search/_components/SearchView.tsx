'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ANIME_SEARCH_MIN_QUERY_LENGTH } from '@/lib/api/anime-search';
import { useDebounce } from '@/hooks/useDebounce';
import { useAnimeSearchQuery } from '@/hooks/queries';
import { SearchData } from './SearchData';
import './search-page.scss';

interface SearchViewProps {
  initialKeyword: string;
}

export function SearchView({ initialKeyword }: SearchViewProps) {
  const [query, setQuery] = useState(initialKeyword);
  const debouncedQuery = useDebounce(query, 250);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();

  const trimmed = query.trim();
  const debouncedTrimmed = debouncedQuery.trim();
  const isTyping = trimmed !== debouncedTrimmed;
  const meetsMinLength = debouncedTrimmed.length >= ANIME_SEARCH_MIN_QUERY_LENGTH;

  const { data: results, isPending, isError, isFetching } = useAnimeSearchQuery(debouncedQuery, {
    enabled: meetsMinLength,
  });

  useEffect(() => {
    setQuery(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsKey);
    if (debouncedTrimmed) {
      params.set('keyword', debouncedTrimmed);
    } else {
      params.delete('keyword');
    }

    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [debouncedTrimmed, router, searchParamsKey]);

  return (
    <div className="search-page">
      <div className="search-page__hero">
        <div className="search-page__input-wrap">
          <input
            type="search"
            placeholder="Search anime by title..."
            autoFocus
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-page__input"
            aria-label="Search anime"
          />
        </div>
      </div>

      <SearchData
        keyword={debouncedTrimmed}
        results={results}
        isPending={isPending}
        isError={isError}
        isFetching={isFetching}
        isTyping={isTyping && meetsMinLength}
      />
    </div>
  );
}
