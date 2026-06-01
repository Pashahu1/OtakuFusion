import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { isDiscoverSection } from '@/shared/data/discover-nav';
import '@/components/genre-hub/genre-browse-layout.scss';
import { DiscoverBrowseContent } from './_components/DiscoverBrowseContent';
import { DiscoverBrowseSkeleton } from './_components/DiscoverBrowseSkeleton';

export default async function DiscoverSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!isDiscoverSection(section)) {
    notFound();
  }

  return (
    <div className="mt-[80px] min-h-[50vh] px-4 pb-16 md:px-6 lg:px-10">
      <div className="genre-browse-page">
        <Suspense key={section} fallback={<DiscoverBrowseSkeleton />}>
          <DiscoverBrowseContent sectionId={section} />
        </Suspense>
      </div>
    </div>
  );
}
