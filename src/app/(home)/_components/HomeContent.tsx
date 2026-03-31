import { getHomePage } from '@/services/getHomePage';
import { ErrorState } from '@/components/ui/states/ErrorState';
import { Preview } from '@/components/Preview/PreviewHero';
import { HomeBelowFold } from './HomeBelowFold';

export async function HomeContent() {
  const homeCatalog = await getHomePage();

  if (!homeCatalog)
    return <ErrorState fullPage message="No home page data available." />;

  return (
    <div className="flex flex-col">
      <Preview
        spotlights={homeCatalog.spotlights || []}
        trending={homeCatalog.trending || []}
      />
      <HomeBelowFold
        topAiring={homeCatalog.topAiring || []}
        mostFavorite={homeCatalog.mostFavorite || []}
        latestEpisode={homeCatalog.latestEpisode || []}
        latestCompleted={homeCatalog.latestCompleted || []}
      />
    </div>
  );
}
