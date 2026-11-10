import { DiscoverBrowseLoadMore } from '@/components/discover/DiscoverBrowseLoadMore';
import { ErrorState } from '@/components/ui/states/ErrorState';
import { DiscoverBrowseI18n } from '@/features/discover/ui/DiscoverBrowseI18n';
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
    return <ErrorState />;
  }

  if (!result || result.items.length === 0) {
    return (
      <div className="genre-browse-layout">
        <DiscoverBrowseI18n sectionId={sectionId} empty />
      </div>
    );
  }

  return (
    <div className="genre-browse-layout">
      <DiscoverBrowseI18n sectionId={sectionId} />
      <DiscoverBrowseLoadMore
        sectionId={sectionId}
        initialItems={result.items}
        initialPage={result.page}
        hasNextPage={result.hasNextPage}
      />
    </div>
  );
}
