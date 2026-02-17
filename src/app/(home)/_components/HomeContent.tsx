import { getHomePage } from "@/services/getHomePage";
import ErrorState from "../../../components/ui/states/ErrorState";
import Preview from "../../../components/Preview/PreviewHero";
import AnimeSection from "../../../components/AnimeSection/AnimeSection";

export async function HomeContent() {
  const homeCatalog = await getHomePage();

  if (!homeCatalog) return <ErrorState fullPage message="No home page data available." />;

  return (
    <div className="flex flex-col">
      <Preview 
        spotlights={homeCatalog.spotlights || []} 
        trending={homeCatalog.trending || []} 
      />
      <div className="flex flex-col gap-[40px]">
        <AnimeSection title="Top Airing" catalog={homeCatalog.topAiring || []} />
        <AnimeSection title="Most Favorite" catalog={homeCatalog.mostFavorite || []} />
        <AnimeSection title="Latest Episode" catalog={homeCatalog.latestEpisode || []} />
        <AnimeSection title="Latest Completed" catalog={homeCatalog.latestCompleted || []} />
      </div>
    </div>
  );
}