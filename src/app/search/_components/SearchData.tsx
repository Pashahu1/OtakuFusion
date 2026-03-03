import { getAnimeSearch } from '@/services/getAnimeSearch';
import { AnimeListLayout } from '@/components/Layout/AnimeListLayout';
import { Card } from '@/components/Card/Card';
import EmptyState from '@/components/ui/states/EmptyState';
import type { AnimeSearchItem } from '@/shared/types/AnimeSearchTypes';

export default async function SearchData({ keyword }: { keyword: string }) {
  if (!keyword.trim()) {
    return <EmptyState message="Please enter Anime name." />;
  }

  try {
    const results = await getAnimeSearch(keyword);

    if (!results || results.length === 0) {
      return (
        <div className="text-center col-span-full">
          <EmptyState message="No results found." />
        </div>
      );
    }

    return (
      <AnimeListLayout>
        {results.map((anime: AnimeSearchItem, idx: number) => (
          <Card key={anime.id || idx} anime={anime} />
        ))}
      </AnimeListLayout>
    );
  } catch (error) {
    return (
      <div className="p-10">
        <EmptyState message="Search service is temporarily unavailable." />
      </div>
    );
  }
}
