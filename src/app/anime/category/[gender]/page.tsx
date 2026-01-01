'use client';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { Card } from '@/components/Card/Card';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { getGenreAnime } from '@/services/getGenreAnime';
import type { AnimeInfo } from '@/shared/types/GlobalTypes';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Pagination } from '@/components/Pagination/Pagination';
import { SkeletonCard } from '@/components/Skeleton/SkeletonCard/SkeletonCard';
import ErrorState from '@/app/error';

export default function GenderPage() {
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get('page') || '1');
  const { gender } = useParams();
  const [genderData, setGenderData] = useState<AnimeInfo[]>([]);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchGenderData = async () => {
      setIsLoading(true);
      if (typeof gender === 'string') {
        let genders = gender.replaceAll('%20', '-');

        try {
          const res = await getGenreAnime(genders, pageParam);
          setGenderData(res.results.data);
          setTotalPage(res.results.totalPages);
          setIsLoading(false);
        } catch {
          console.error('Failed to fetch');
          setError(true);
        }
      }
    };
    fetchGenderData();
  }, [gender, pageParam]);

  return (
    <div className="flex flex-col g-[20px]">
      {error && <ErrorState message="Failed to load gender page." />}
      {isLoading && <InitialLoader />}
      {!isLoading && (
        <>
          <AnimeListLayout
            title={typeof gender === 'string' ? gender : gender?.[0]}
          >
            {isLoading
              ? Array(genderData.length)
                  .fill(null)
                  .map((_, i) => <SkeletonCard key={i} />)
              : genderData.map((anime) => (
                  <Card key={anime.id} anime={anime} />
                ))}
          </AnimeListLayout>

          <Pagination pageCount={totalPage} currentPage={pageParam} />
        </>
      )}
    </div>
  );
}
