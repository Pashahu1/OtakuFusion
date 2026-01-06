'use client';

import { useEffect, useState } from 'react';
import './Search.scss';
import { getAnimeSearch } from '@/services/getAnimeSearch';
import { Card } from '@/components/Card/Card';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { SkeletonCard } from '@/components/Skeleton/SkeletonCard/SkeletonCard';
import ErrorState from '@/components/ui/states/ErrorState';
import { normalizeError } from '@/lib/errors/normalizeError';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchSkeleton } from '@/components/ui/Skeleton/SearchSkeleton';
import EmptyState from '@/components/ui/states/EmptyState';

export default function Search() {
  const params = useSearchParams();
  const initialKeyword = params.get('keyword') || '';
  const [query, setQuery] = useState(initialKeyword);

  const debouncedQuery = useDebounce(query, 400);
  const [results, setResults] = useState([]);
  const [initialization, setInitialization] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ReturnType<typeof normalizeError> | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      router.replace('/search');
      setIsLoading(false);
      setInitialization(false);
      return;
    }

    let isCancelled = false;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await getAnimeSearch(debouncedQuery);
        if (!isCancelled) {
          setResults(response.data);
          router.replace(
            `/search?keyword=${encodeURIComponent(debouncedQuery)}`
          );
        }
      } catch (err) {
        if (!isCancelled) {
          const normalizedError = normalizeError(err);
          console.error('Failed to fetch search results:', err);
          setError(normalizedError);
          setResults([]);
        }
      } finally {
        if (!isCancelled) {
          setInitialization(false);
          setIsLoading(false);
        }
      }
    };

    fetchResults();
    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, router]);

  useEffect(() => {
    setError(null);
  }, [query]);

  if (error) {
    return <ErrorState message="Failed to get results." />;
  }

  if (isLoading && initialization) {
    return <InitialLoader />;
  }

  return (
    <div className="search-page">
      <div className="search-page__input">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <AnimeListLayout>
        {!isLoading && !error && debouncedQuery && results.length === 0 && (
          <EmptyState message="No results found." />
        )}

        {!debouncedQuery && <EmptyState message="Please enter Anime name." />}

        {isLoading && <SearchSkeleton />}

        {!isLoading && results.length > 0 && (
          <>
            {results.map((anime, idx) => (
              <Card key={anime + idx} anime={anime} />
            ))}
          </>
        )}
      </AnimeListLayout>
    </div>
  );
}
