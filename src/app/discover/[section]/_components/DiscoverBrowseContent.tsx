import { DiscoverBrowseHeader } from '@/components/discover/DiscoverBrowseHeader';
import { DiscoverBrowseLoadMore } from '@/components/discover/DiscoverBrowseLoadMore';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { ErrorState } from '@/components/ui/states/ErrorState';
import { getDiscoverBrowsePage } from '@/lib/api/discover';
import { getDiscoverSection } from '@/shared/data/discover-nav';
import '@/components/genre-hub/genre-browse-layout.scss';

interface DiscoverBrowseContentProps {
  sectionId: string;
}

export async function DiscoverBrowseContent({
  sectionId,
}: DiscoverBrowseContentProps) {
  const section = getDiscoverSection(sectionId);
  if (!section) return null;

  let result;
  try {
    result = await getDiscoverBrowsePage({ sectionId, page: 1 });
  } catch {
    return <ErrorState message="Failed to load titles." />;
  }

  if (!result || result.items.length === 0) {
    return (
      <div className="genre-browse-layout">
        <DiscoverBrowseHeader
          title={section.label}
          description={section.description}
        />
        <EmptyState message={`No titles found for ${section.label}.`} />
      </div>
    );
  }

  return (
    <div className="genre-browse-layout">
      <DiscoverBrowseHeader
        title={section.label}
        description={section.description}
      />
      <DiscoverBrowseLoadMore
        sectionId={sectionId}
        initialItems={result.items}
        initialPage={result.page}
        hasNextPage={result.hasNextPage}
      />
    </div>
  );
}
