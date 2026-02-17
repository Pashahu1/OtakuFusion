import AnimeFilters from './_components/AnimeFilters';
import AnimeData from './_components/AnimeData';
import { Suspense } from 'react';
import { GenderSkeleton } from '@/components/ui/Skeleton/GenderSkeleton';

export default async function AnimePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const parsedParams = await searchParams;
  const currentPage = Number(parsedParams.page || '1');
  const currentCategory = parsedParams.category || 'most-favorite';

  return (
    <div className="mt-[80px] px-4 lg:px-10">
      <AnimeFilters selected={currentCategory} />
      <Suspense
        key={currentCategory + currentPage}
        fallback={<GenderSkeleton />}
      >
        <AnimeData category={currentCategory} page={currentPage} />
      </Suspense>
    </div>
  );
}
