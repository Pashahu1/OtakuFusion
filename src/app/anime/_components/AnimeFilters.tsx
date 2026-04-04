'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { categoryes } from '@/shared/data/category';

export function AnimeFilters({ selected }: { selected: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategory = (category: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('category', category);
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-10 grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
      {categoryes.map((cat, idx) => (
        <button
          className={`h-[50px] rounded-md transition-colors ${
            cat === selected
              ? 'bg-brand-orange-dark text-black'
              : 'bg-brand-gray text-white'
          }`}
          key={idx}
          onClick={() => handleCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
