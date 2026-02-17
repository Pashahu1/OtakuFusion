'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchInput({
  initialValue,
}: {
  initialValue: string;
}) {
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
    <div className="search-page__input">
      <input
        type="text"
        placeholder="Search..."
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
