import { getHomePage } from '@/services/getHomePage';
import { ErrorState } from '@/components/ui/states/ErrorState';
import { Preview } from '@/components/Preview/PreviewHero';
import { ContinueWatchingSection } from '@/components/ContinueWatchingSection/ContinueWatchingSection';
import { SwiperCard } from '@/components/SwiperCard/SwiperCard';

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
      <div className="flex flex-col gap-8 md:gap-10 lg:gap-[40px]">
        <SwiperCard title="Top Airing" catalog={homeCatalog.topAiring || []} />
        <SwiperCard
          title="Most Favorite"
          catalog={homeCatalog.mostFavorite || []}
        />
        <SwiperCard
          title="Latest Episode"
          catalog={homeCatalog.latestEpisode || []}
        />
        <SwiperCard
          title="Latest Completed"
          catalog={homeCatalog.latestCompleted || []}
        />
      </div>
    </div>
  );
}
