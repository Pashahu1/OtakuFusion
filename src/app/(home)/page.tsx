'use client';
import { getHomePage } from '@/services/getHomePage';
import type { HomePageType } from '@/shared/types/HomePageTypes';
import { useEffect, useState } from 'react';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import ErrorState from '@/components/ui/states/ErrorState';
import { normalizeError } from '@/lib/errors/normalizeError';
import AnimeSection from '@/components/AnimeSection/AnimeSection';
import Preview from '@/components/Preview/PreviewHero';
import { AnimeSectionSkeleton } from '@/components/ui/Skeleton/AnimeSectionSkeleton';
import { PreviewSkeleton } from '@/components/ui/Skeleton/PreviewSkeleton';

export default function Home() {
  const [homeCatalog, setHomeCatalog] = useState<HomePageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<ReturnType<typeof normalizeError> | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        const data = await getHomePage();
        setHomeCatalog(data);
      } catch (err) {
        const normalizedError = normalizeError(err);
        console.error('Failed to fetch home page catalog data:', err);
        setHomeCatalog(null);
        setError(normalizedError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

  if (isInitializing) {
    return <InitialLoader />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-10">
        <PreviewSkeleton />
        <AnimeSectionSkeleton title="Top Airing" />
        <AnimeSectionSkeleton title="Most Favorite" />
        <AnimeSectionSkeleton title="Latest Episode" />
        <AnimeSectionSkeleton title="Latest Completed" />
      </div>
    );
  }

  if (error) {
    return <ErrorState fullPage message={error.message} />;
  }
  if (!homeCatalog) {
    return <ErrorState fullPage message="No home page data available." />;
  }

  return (
    <div className="flex flex-col">
      <Preview
        spotlights={homeCatalog?.spotlights || []}
        trending={homeCatalog?.trending || []}
      />
      <div className="flex flex-col gap-[40px]">
        <AnimeSection
          title="Top Airing"
          catalog={homeCatalog?.topAiring || []}
        />
        <AnimeSection
          title="Most Favorite"
          catalog={homeCatalog?.mostFavorite || []}
        />
        <AnimeSection
          title="Latest Episode"
          catalog={homeCatalog?.latestEpisode || []}
        />
        <AnimeSection
          title="Latest Completed"
          catalog={homeCatalog?.latestCompleted || []}
        />
      </div>
    </div>
  );
}
