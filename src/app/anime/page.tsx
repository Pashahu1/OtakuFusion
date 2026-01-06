'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/Card/Card';
import { Pagination } from '@/components/Pagination/Pagination';
import { getCategory } from '@/services/getCategory';
import { categoryes } from '../../shared/data/category';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import type { AnimeInfo } from '@/shared/types/GlobalTypes';
import ErrorState from '@/components/ui/states/ErrorState';
import { normalizeError } from '@/lib/errors/normalizeError';
import EmptyState from '@/components/ui/states/EmptyState';
import { CategorySkeleton } from '@/components/ui/Skeleton/CategorySkeleton';

export default function Animes() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = Number(searchParams.get('page') || '1');
  const [category, setCategory] = useState<AnimeInfo[]>([]);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<ReturnType<typeof normalizeError> | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] =
    useState<string>('most-favorite');

  let titleCategory = selectedCategory
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  useEffect(() => {
    const fetchAnimesCategory = async () => {
      setIsLoading(true);
      try {
        const res = await getCategory(selectedCategory, pageParam);
        setCategory(res.results.data);
        setTotalPage(res.results.totalPages);
      } catch (err) {
        const normalizedError = normalizeError(err);
        console.error('Failed to fetch category page catalog data:', err);
        setCategory([]);
        setTotalPage(0);
        setError(normalizedError);
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
      }
    };

    fetchAnimesCategory();
  }, [pageParam, selectedCategory]);

  const handleCategory = (category: string) => {
    if (category !== selectedCategory) {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      router.push(`?${params}`, { scroll: false });
      setSelectedCategory(category);
    }
  };

  if (isInitializing && isLoading) {
    return <InitialLoader />;
  }

  if (isLoading) return <CategorySkeleton />;
  if (error) {
    return <ErrorState fullPage message={error.message} />;
  }

  if (!Array.isArray(category) || category.length === 0) {
    return (
      <EmptyState
        fullPage
        title={titleCategory}
        message="No anime found in this category."
      />
    );
  }

  return (
    <>
      <div className="mt-[80px]">
        <div className="grid grid-cols-2 gap-[20px] px-4 md:grid-cols-3 md:px-6 lg:grid-cols-4 lg:px-10 xl:grid-cols-6 xl:px-20">
          {categoryes.map((cat, idx) => (
            <button
              className={`h-[50px] rounded-md ${cat === selectedCategory ? 'bg-brand-orange-dark text-black' : 'bg-brand-gray text-white'}`}
              key={idx}
              onClick={() => handleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <AnimeListLayout title={titleCategory}>
          {category.map((anime) => (
            <Card key={anime.id} anime={anime} />
          ))}
        </AnimeListLayout>

        <Pagination pageCount={totalPage} currentPage={pageParam} />
      </div>
    </>
  );
}
