import { notFound } from 'next/navigation';
import { SwiperCard } from '@/components/SwiperCard/SwiperCard';
import { GenreHubHeader } from '@/components/genre-hub/GenreHubHeader';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { ErrorState } from '@/components/ui/states/ErrorState';
import { getGenreHubSections } from '@/lib/api/genre-hub';
import {
  GENRE_HUB_SECTIONS,
  isKnownGenre,
} from '@/shared/data/genre-hub';
import { genreBrowsePath, genreFromSlug } from '@/shared/utils/genre-slug';

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
      <div className="home-feed flex w-full flex-col gap-8 pt-6 md:gap-10 md:pt-8 lg:gap-10">
        {GENRE_HUB_SECTIONS.map((section) => {
          const catalog = sections[section.id] ?? [];
          if (!catalog.length) return null;
          return (
            <SwiperCard
              key={section.id}
              title={section.label}
              catalog={catalog}
              sectionId={`genre-${section.id}`}
              viewAllHref={genreBrowsePath(genre, section.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
