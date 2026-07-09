'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';import { Episodelist } from '@/features/watch';
import { WatchEpisodesEmptySection } from '@/features/watch/ui/episode-list/WatchEpisodesEmptySection';
import { useWatchSeries } from '@/features/watch/hooks/useWatchSeries';
import { useWatchSpotlightArtwork } from '@/features/watch/hooks/useWatchSpotlightArtwork';
import { buildWatchHeroModel } from '@/features/watch/lib/buildWatchHeroModel';
import { WatchSeriesHero } from '@/features/watch/ui/watch-series/WatchSeriesHero';
import { WatchPageSkeleton } from '@/features/watch/ui/watch-series/WatchPageSkeleton';
import { useWatchPageDocumentTitle } from '@/features/watch/hooks/useWatchPageDocumentTitle';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AnimeSection } from '@/components/AnimeSection/AnimeSection';
import { formatEpisodeDuration } from '@/features/watch/lib/format-episode-duration';
import { buildWatchUnavailableMessage } from '@/features/watch/lib/build-watch-unavailable-message';
import { watchPlayPath } from '@/shared/utils/watch-routes';
import { useWatchCta } from '@/features/watch/hooks/useWatchCta';
import './watch-page.scss';

export default function WatchSeriesPageClient({ animeId }: { animeId: string }) {
  const router = useRouter();
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  const {
    animeInfo,
    episodes,
    totalEpisodes,
    episodeId,
    nextEpisodeSchedule,
  } = useWatchSeries(animeId);
  useWatchPageDocumentTitle(animeInfo, animeId);

  const { data: spotlightArtwork, isPending: heroArtworkPending } =
    useWatchSpotlightArtwork(animeInfo);

  const heroModel = useMemo(() => {
    if (!animeInfo) return null;
    return buildWatchHeroModel(animeInfo, spotlightArtwork);
  }, [animeInfo, spotlightArtwork]);

  const episodeDuration = formatEpisodeDuration(
    animeInfo?.animeInfo?.tvInfo?.duration
  );

  const { playHref, ctaLabel, isPlayable } = useWatchCta({
    animeId,
    dataId: animeInfo?.data_id,
    episodes,
  });
  const episodesUnavailableMessage = useMemo(
    () =>
      buildWatchUnavailableMessage({
        nextEpisodeSchedule,
        releaseDate: animeInfo?.animeInfo?.tvInfo?.releaseDate,
      }),
    [animeInfo?.animeInfo?.tvInfo?.releaseDate, nextEpisodeSchedule],
  );

  const [watchedEpisodes] = useLocalStorage<Record<string, boolean>>(
    `watched-${animeId}`,
    {}
  );

  const isPageReady = Boolean(animeInfo && episodes);

  if (!isPageReady) {    return (
      <div className="watch-page">
        <WatchPageSkeleton />
      </div>
    );
  }

  const handleEpisodeClick = (ep: string) => {
    router.push(watchPlayPath(animeId, ep));
  };

  return (
    <div className="watch-page">
      <WatchSeriesHero
        hero={heroModel!}
        animeInfo={animeInfo!}
        playHref={playHref}
        ctaLabel={ctaLabel}
        isCtaPlayable={isPlayable}
        isDetailsExpanded={isDetailsExpanded}
        onToggleDetails={() => setIsDetailsExpanded((v) => !v)}
        heroArtworkPending={heroArtworkPending}
      />

      {episodes!.length === 0 ? (
        <WatchEpisodesEmptySection message={episodesUnavailableMessage} />
      ) : (
        <Episodelist
          animeId={animeId}
          episodes={episodes!}
          currentEpisode={episodeId ?? null}          onEpisodeClick={handleEpisodeClick}
          totalEpisodes={totalEpisodes ?? 0}
          watchedEpisodes={watchedEpisodes}
          seriesTitle={animeInfo!.title ?? ''}
          posterUrl={animeInfo!.poster ?? ''}
          episodeDuration={episodeDuration}
        />
      )}

      {(animeInfo!.recommended_data?.length ?? 0) > 0 ? (
        <div className="watch-page__recommended">
          <AnimeSection
            title="Recommended for you"
            catalog={animeInfo!.recommended_data ?? []}
          />
        </div>
      ) : null}
    </div>
  );
}