import { getAnimeSearch } from '@/services/getAnimeSearch';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { Card } from '@/components/Card/Card';
import { EmptyState } from '@/components/ui/states/EmptyState';
import type { AnimeSearchItems } from '@/shared/types/AnimeSearchTypes';

export async function SearchData({ keyword }: { keyword: string }) {
  if (!keyword.trim()) {
    return <EmptyState message="Please enter Anime name." />;
  }

  let results: AnimeSearchItems[] | null = null;
  let hasError = false;

  try {
    results = await getAnimeSearch(keyword);
  } catch {
    hasError = true;
  }

  if (hasError) {
    return (
      <div className="px-4 py-8 sm:p-10">
        <EmptyState message="Search service is temporarily unavailable." />
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="col-span-full text-center">
        <EmptyState message="No results found." />
      </div>
    );
  }

  return (
    <AnimeListLayout>
      {results.map((anime: AnimeSearchItems, idx: number) => (
        <Card key={anime.id || idx} anime={anime} />
      ))}
    </AnimeListLayout>
  );
}
