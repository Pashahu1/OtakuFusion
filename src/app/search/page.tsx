import { Suspense } from 'react';
import './Search.scss';
import { SearchSkeleton } from '@/components/ui/Skeleton/SearchSkeleton';
import SearchInput from './_components/SearchInput';
import SearchData from './_components/SearchData';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string }>;
}) {
  const { keyword = '' } = await searchParams;

  return (
    <div className="flex flex-col gap-5">
      <SearchInput initialValue={keyword} />

      <Suspense key={keyword} fallback={<SearchSkeleton />}>
        <SearchData keyword={keyword} />
      </Suspense>
    </div>
  );
}
