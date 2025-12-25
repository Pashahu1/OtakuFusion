"use client";
import { getHomePage } from "@/services/getHomePage";
import type { HomePageType } from "@/shared/types/HomePageTypes";
import { useEffect, useState } from "react";
import { InitialLoader } from "@/components/ui/InitialLoader/InitialLoader";
import dynamic from "next/dynamic";
import { SkeletonPreview } from "@/components/ui/SkeletonPreview/SkeletonPreview";
import SkeletonSection from "@/components/Skeleton/SkeletonSection/SkeletonSection";
import ErrorMessage from "@/components/Error/ErrorMessage";

const LazyPreview = dynamic(() => import("@/components/Preview/PreviewHero"), {
  ssr: false,
  loading: () => <SkeletonPreview />,
});

const LazyAnimeSection = dynamic(
  () => import("@/components/AnimeSection/AnimeSection"),
  {
    ssr: false,
    loading: () => <SkeletonSection />,
  }
);

export default function Home() {
  const [homeCatalog, setHomeCatalog] = useState<HomePageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        const data = await getHomePage();
        setHomeCatalog(data);
      } catch (err) {
        console.error("Failed to fetch home page catalog data:", err);
        setHomeCatalog(null);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

  if (isLoading) return <InitialLoader />;

  return (
    <div className="w-[100%]">
      <div className="flex flex-col">
        {error && <ErrorMessage message="Failed to load home page." />}
        <section>
          <LazyPreview
            spotlights={homeCatalog?.spotlights || []}
            trending={homeCatalog?.trending || []}
          />
        </section>
        <div className="flex flex-col px-[20px] gap-[40px] mt-[60px]">
          <LazyAnimeSection
            title="Top Airing"
            catalog={homeCatalog?.topAiring || []}
          />
          <LazyAnimeSection
            title="Most Favorite"
            catalog={homeCatalog?.mostFavorite || []}
          />
          <LazyAnimeSection
            title="Latest Episode"
            catalog={homeCatalog?.latestEpisode || []}
          />
          <LazyAnimeSection
            title="Latest Completed"
            catalog={homeCatalog?.latestCompleted || []}
          />
        </div>
      </div>
    </div>
  );
}
