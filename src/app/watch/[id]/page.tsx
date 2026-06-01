'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Episodelist } from '@/features/watch';
import { useWatchSeries } from '@/features/watch/hooks/useWatchSeries';
import { useWatchSpotlightArtwork } from '@/features/watch/hooks/useWatchSpotlightArtwork';
import { buildWatchHeroModel } from '@/features/watch/lib/buildWatchHeroModel';
import { WatchSeriesHero } from '@/features/watch/ui/watch-series/WatchSeriesHero';
import { WatchEpisodesSkeleton } from '@/features/watch/ui/watch-series/WatchEpisodesSkeleton';
import { useWatchPageDocumentTitle } from '@/features/watch/hooks/useWatchPageDocumentTitle';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AnimeSection } from '@/components/AnimeSection/AnimeSection';
import { AnimeSectionSkeleton } from '@/components/ui/Skeleton/AnimeSectionSkeleton';
import { formatEpisodeDuration } from '@/features/watch/lib/format-episode-duration';
import { watchPlayPath } from '@/shared/utils/watch-routes';
import { useWatchCta } from '@/features/watch/hooks/useWatchCta';
import './watch-page.scss';

export default function WatchSeriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const animeIdRaw = params?.id;
  const animeId =
    typeof animeIdRaw === 'string'
      ? animeIdRaw
      : Array.isArray(animeIdRaw)
        ? (animeIdRaw[0] ?? '')
        : '';
  const urlEp = searchParams.get('ep') ?? undefined;
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  useEffect(() => {
    const ep = urlEp?.trim();
    if (!animeId || !ep) return;
    router.replace(watchPlayPath(animeId, ep));
  }, [animeId, urlEp, router]);

  const {
    animeInfo,
    episodes,
    totalEpisodes,
    episodeId,
  } = useWatchSeries(animeId || '', urlEp);

  useWatchPageDocumentTitle(animeInfo, animeId);

  const { data: spotlightArtwork } = useWatchSpotlightArtwork(animeInfo);

  const heroModel = useMemo(() => {
    if (!animeInfo) return null;
    return buildWatchHeroModel(animeInfo, spotlightArtwork);
  }, [animeInfo, spotlightArtwork]);

  const episodeDuration = formatEpisodeDuration(
    animeInfo?.animeInfo?.tvInfo?.duration
  );

  const { playHref, ctaLabel } = useWatchCta({
    animeId,
    urlEp,
    episodes,
  });

  const [watchedEpisodes] = useLocalStorage<Record<string, boolean>>(
    `watched-${animeId}`,
    {}
  );

  if (urlEp?.trim()) {
    return <div className="watch-page__hero-skeleton" aria-busy aria-label="Loading player" />;
  }

  const handleEpisodeClick = (ep: string) => {
    router.push(watchPlayPath(animeId, ep));
  };

  return (
    <div className="watch-page">
      {heroModel && animeInfo ? (
        <WatchSeriesHero
          hero={heroModel}
          animeInfo={animeInfo}
          playHref={playHref}
          ctaLabel={ctaLabel}
          isDetailsExpanded={isDetailsExpanded}
          onToggleDetails={() => setIsDetailsExpanded((v) => !v)}
        />
      ) : (
        <div className="watch-page__hero-skeleton" aria-hidden />
      )}

      {episodes ? (
        <Episodelist
          episodes={episodes}
          currentEpisode={episodeId ?? urlEp ?? null}
          onEpisodeClick={handleEpisodeClick}
          totalEpisodes={totalEpisodes ?? 0}
          watchedEpisodes={watchedEpisodes}
          seriesTitle={animeInfo?.title ?? ''}
          posterUrl={animeInfo?.poster ?? ''}
          episodeDuration={episodeDuration}
        />
      ) : (
        <WatchEpisodesSkeleton />
      )}

      <div className="watch-page__recommended">
        {(animeInfo?.recommended_data?.length ?? 0) > 0 ? (
          <AnimeSection
            title="Recommended for you"
            catalog={animeInfo?.recommended_data ?? []}
          />
        ) : (
          <AnimeSectionSkeleton title="Recommended for you" />
        )}
      </div>
    </div>
  );
}
