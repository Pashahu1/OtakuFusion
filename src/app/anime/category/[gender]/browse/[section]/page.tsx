import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import {
  getGenreSectionConfig,
  isKnownGenre,
  type GenreMediaFilter,
} from '@/shared/data/genre-hub';
import { genreFromSlug } from '@/shared/utils/genre-slug';
import '@/components/genre-hub/genre-browse-layout.scss';
import { GenreBrowseContent } from './_components/GenreBrowseContent';
import { GenreBrowseSkeleton } from './_components/GenreBrowseSkeleton';

function parseMedia(value: string | undefined): GenreMediaFilter {
  if (value === 'tv' || value === 'movie') return value;
  return 'all';
}

export default async function GenreBrowsePage({
  params,
  searchParams,
}: {
  params: Promise<{ gender: string; section: string }>;
  searchParams: Promise<{ media?: string }>;
}) {
  const { gender: slug, section: sectionId } = await params;
  const genre = genreFromSlug(slug);
  const section = getGenreSectionConfig(sectionId);

  if (!section || !isKnownGenre(genre)) {
    notFound();
  }

  const sp = await searchParams;
  const media = parseMedia(sp.media);

  return (
    <div className="mt-[80px] min-h-[50vh] px-4 pb-16 md:px-6 lg:px-10">
      <div className="genre-browse-page">
        <Suspense
          key={`${genre}-${sectionId}-${media}`}
          fallback={<GenreBrowseSkeleton />}
        >
          <GenreBrowseContent genre={genre} sectionId={sectionId} media={media} />
        </Suspense>
      </div>
    </div>
  );
}
