'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { categoryes } from '@/shared/data/category';

export default function AnimeFilters({ selected }: { selected: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategory = (category: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('category', category);
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="grid grid-cols-2 gap-[20px] md:grid-cols-3 lg:grid-cols-4 px-4 lg:px-10 xl:grid-cols-6 mb-10">
      {categoryes.map((cat, idx) => (
        <button
          className={`h-[50px] rounded-md transition-colors ${
            cat === selected ? 'bg-brand-orange-dark text-black' : 'bg-brand-gray text-white'
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