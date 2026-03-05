// 'use client';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { Card } from '@/components/Card/Card';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { getGenreAnime } from '@/services/getGenreAnime';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { Suspense } from 'react';
import { Pagination } from '@/components/Pagination/Pagination';
import ErrorState from '@/components/ui/states/ErrorState';
import { normalizeError } from '@/lib/errors/normalizeError';
import EmptyState from '@/components/ui/states/EmptyState';
import { GenderSkeleton } from '@/components/ui/Skeleton/GenderSkeleton';
import GenderData from './_components/GenderData';

export default async function GenderPage({
  params,
  searchParams,
}: {
  params: Promise<{ gender: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [parsedParams, parsedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const genderTitle = parsedParams.gender;
  const currentPage = Number(parsedSearchParams.page || '1');

  return (
    <div className="flex flex-col g-[20px]">
      <Suspense key={genderTitle + currentPage} fallback={<GenderSkeleton />}>
        <GenderData gender={genderTitle} page={currentPage} />
      </Suspense>
    </div>
  );
}
