'use client';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { Card } from '@/components/Card/Card';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { getGenreAnime } from '@/services/getGenreAnime';
import type { AnimeInfo } from '@/shared/types/GlobalTypes';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Pagination } from '@/components/Pagination/Pagination';
import ErrorState from '@/components/ui/states/ErrorState';
import { normalizeError } from '@/lib/errors/normalizeError';
import EmptyState from '@/components/ui/states/EmptyState';
import { GenderSkeleton } from '@/components/ui/Skeleton/GenderSkeleton';

export default function GenderPage() {
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get('page') || '1');
  const { gender } = useParams();
  const [genderData, setGenderData] = useState<AnimeInfo[]>([]);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<ReturnType<typeof normalizeError> | null>(
    null
  );

  const rawGender = Array.isArray(gender) ? gender[0] : gender;
  const title = rawGender ? rawGender.replaceAll('%20', '-') : 'Unknown';

  useEffect(() => {
    const fetchGenderData = async () => {
      setIsLoading(true);
      try {
        const res = await getGenreAnime(title, pageParam);
        setGenderData(res.results.data);
        setTotalPage(res.results.totalPages);
      } catch (err) {
        const normalizedError = normalizeError(err);
        setGenderData([]);
        setTotalPage(0);
        console.error('Failed to fetch gender page catalog data:', err);
        setError(normalizedError);
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
      }
    };
    fetchGenderData();
  }, [gender, pageParam]);

  if (isInitializing && isLoading) {
    return <InitialLoader />;
  }
  
  if(isLoading) return <GenderSkeleton />;

  if (error) {
    return <ErrorState fullPage message={error.message} />;
  }

  if (!Array.isArray(genderData) || genderData.length === 0) {
    return <EmptyState fullPage message="No anime found for this gender." />;
  }

  return (
    <div className="flex flex-col g-[20px]">
      <AnimeListLayout title={title}>
        {genderData.map((anime) => (
          <Card key={anime.id} anime={anime} />
        ))}
      </AnimeListLayout>

      <Pagination pageCount={totalPage} currentPage={pageParam} />
    </div>
  );
}
