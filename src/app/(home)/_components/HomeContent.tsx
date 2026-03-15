import { getHomePage } from '@/services/getHomePage';
import ErrorState from '@/components/ui/states/ErrorState';
import { Preview } from '@/components/Preview/PreviewHero';
import { ContinueWatchingSection } from '@/components/ContinueWatchingSection/ContinueWatchingSection';
import SwiperCard from '@/components/SwiperCard/SwiperCard';

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
      <ContinueWatchingSection />
      <div className="flex flex-col gap-[40px]">
        <SwiperCard catalog={homeCatalog.topAiring || []} />
        <SwiperCard catalog={homeCatalog.mostFavorite || []} />
        <SwiperCard catalog={homeCatalog.latestEpisode || []} />
        <SwiperCard catalog={homeCatalog.latestCompleted || []} />
      </div>
    </div>
  );
}
