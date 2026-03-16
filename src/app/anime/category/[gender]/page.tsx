import { Suspense } from 'react';
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
    <div className="g-[20px] flex flex-col">
      <Suspense key={genderTitle + currentPage} fallback={<GenderSkeleton />}>
        <GenderData gender={genderTitle} page={currentPage} />
      </Suspense>
    </div>
  );
}
