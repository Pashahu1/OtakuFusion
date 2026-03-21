'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

export function SearchInput({ initialValue }: { initialValue: string }) {
  const [query, setQuery] = useState(initialValue);
  const debouncedQuery = useDebounce(query, 400);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set('keyword', debouncedQuery);
    } else {
      params.delete('keyword');
    }

    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, router]);

  return (
    <div className="mt-[60px] flex w-full justify-center bg-[#141519] px-4 py-6 sm:px-8 sm:py-8">
      <input
        type="text"
        placeholder="Search..."
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mx-auto h-11 w-full max-w-[880px] border-b border-zinc-500 bg-transparent px-2.5 text-white placeholder:text-zinc-500 focus:border-zinc-300 focus:outline-none sm:h-[50px]"
      />
    </div>
  );
}
