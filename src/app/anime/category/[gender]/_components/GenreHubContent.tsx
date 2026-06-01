import { notFound } from 'next/navigation';
import { GenreHubHeader } from '@/components/genre-hub/GenreHubHeader';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { ErrorState } from '@/components/ui/states/ErrorState';
import { getGenreHubSections } from '@/lib/api/genre-hub';
import {
  GENRE_HUB_SECTIONS,
  isKnownGenre,
} from '@/shared/data/genre-hub';
import { genreFromSlug } from '@/shared/utils/genre-slug';
import { GenreHubFeed } from './GenreHubFeed';

interface GenreHubContentProps {
  slug: string;
}

export async function GenreHubContent({ slug }: GenreHubContentProps) {
  const genre = genreFromSlug(slug);

  if (!isKnownGenre(genre)) {
    notFound();
  }

  let sections;
  try {
    sections = await getGenreHubSections(genre);
  } catch {
    return <ErrorState message="Failed to load genre." />;
  }

  if (!sections) {
    return <EmptyState fullPage message="This genre is not available." />;
  }

  const hasAny = GENRE_HUB_SECTIONS.some(
    (s) => (sections[s.id]?.length ?? 0) > 0
  );

  if (!hasAny) {
    return (
      <div className="mt-[80px]">
        <GenreHubHeader genre={genre} />
        <EmptyState message={`No anime found for ${genre}.`} />
      </div>
    );
  }

  return (
    <div className="mt-[80px] pb-16">
      <GenreHubHeader genre={genre} />
      <GenreHubFeed genre={genre} sections={sections} />
    </div>
  );
}
