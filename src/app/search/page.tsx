import { Suspense } from 'react';
import { SearchView } from './_components/SearchView';
import { SearchSkeleton } from '@/components/ui/Skeleton/SearchSkeleton';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string }>;
}) {
  const { keyword = '' } = await searchParams;

  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchView initialKeyword={keyword} />
    </Suspense>
  );
}
