'use client';

import { useCallback, useRef, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { useWatch } from '@/hooks/useWatch';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Episodelist } from '@/components/Episodelist/Episodelist';
import { AnimeSection } from '@/components/AnimeSection/AnimeSection';
import { AnimeSectionSkeleton } from '@/components/ui/Skeleton/AnimeSectionSkeleton';
import { useWatchPageEffects } from '@/hooks/watch/useWatchPageEffects';
import { WatchInfoPanel } from '@/components/WatchInfoPanel/WatchInfoPanel';
import { WatchPlayerContent } from '@/components/WatchPlayerContent/WatchPlayerContent';
import { onEpisodeWatched as markWatchedInStorage } from '@/helper/WatchedEpisodes';

export default function Watch() {
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
  const [showErrorBlock, setShowErrorBlock] = useState(false);

  const posterImgRef = useRef<HTMLImageElement | null>(null);
  const playerColumnRef = useRef<HTMLDivElement>(null);
  const [episodesColumnHeight, setEpisodesColumnHeight] = useState<
    number | null
  >(null);
  const [watchedEpisodes, setWatchedEpisodes] = useLocalStorage<
    Record<string, boolean>
  >(`watched-${animeId}`, {});
  const {
    buffering,
    streamInfo,
    animeInfo,
    episodes,
    nextEpisodeSchedule,
    totalEpisodes,
    isFullOverview,
    setIsFullOverview,
    activeEpisodeNum,
    streamUrl,
    subtitles,
    thumbnail,
    intro,
    outro,
    episodeId,
    setEpisodeId,
    activeServerId,
    setActiveServerId,
    servers,
    serverLoading,
  } = useWatch(animeId || '', urlEp ?? undefined);

  const hasAppliedSavedEpisodeRef = useRef(false);
  const isFirstSet = useRef(true);
  const errorBlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useWatchPageEffects(
    hasAppliedSavedEpisodeRef,
    animeId,
    setEpisodeId,
    episodeId,
    episodes,
    urlEp,
    isFirstSet,
    serverLoading,
    buffering,
    streamUrl,
    animeInfo,
    nextEpisodeSchedule,
    errorBlockTimerRef,
    setShowErrorBlock,
    playerColumnRef,
    setEpisodesColumnHeight
  );

  const onEpisodeWatched = useCallback(
    (id: string) => markWatchedInStorage(id, setWatchedEpisodes),
    [setWatchedEpisodes]
  );

  return (
    <div className="relative flex h-fit w-full flex-col items-center justify-center">
      <div className="relative w-full px-4 sm:px-5 md:px-6 min-[1200px]:px-8 xl:px-10">
        <div className="watch-layout relative z-10 mt-16 grid w-full gap-4 pb-[50px] max-md:mt-[50px] min-[1200px]:mt-32 min-[1200px]:grid-cols-[minmax(280px,28%)_1fr_minmax(240px,22%)] max-[1199px]:grid-cols-1 md:max-[1199px]:grid-cols-2">
          <div
            className="watch-episodes episodes flex min-h-[480px] min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#23252b]/85 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md max-[1199px]:order-2 max-md:min-h-[280px] md:max-[1199px]:min-h-[320px]"
            style={
              episodesColumnHeight != null
                ? { height: `${episodesColumnHeight}px` }
                : undefined
            }
          >
            {!episodes ? (
              <div className="h-full min-h-[280px] w-full animate-pulse rounded-lg bg-white/5" />
            ) : (
              <Episodelist
                episodes={episodes}
                currentEpisode={episodeId}
                onEpisodeClick={(id) => setEpisodeId(id)}
                totalEpisodes={totalEpisodes ?? 0}
                watchedEpisodes={watchedEpisodes}
              />
            )}
          </div>

          <WatchPlayerContent
            playerColumnRef={playerColumnRef}
            serverLoading={serverLoading}
            buffering={buffering}
            streamUrl={streamUrl}
            subtitles={subtitles}
            intro={intro}
            outro={outro}
            thumbnail={thumbnail}
            episodeId={episodeId}
            episodes={episodes}
            setEpisodeId={setEpisodeId}
            onEpisodeWatched={onEpisodeWatched}
            animeInfo={animeInfo}
            episodeNum={activeEpisodeNum}
            streamInfo={streamInfo}
            servers={servers}
            activeServerId={activeServerId}
            setActiveServerId={setActiveServerId}
            showErrorBlock={showErrorBlock}
          />

          <WatchInfoPanel
            animeInfo={animeInfo}
            nextEpisodeSchedule={nextEpisodeSchedule}
            posterImgRef={posterImgRef}
            isFullOverview={isFullOverview}
            setIsFullOverview={setIsFullOverview}
          />
        </div>
      </div>

      <div className="grid w-full max-w-[1920px] grid-cols-[minmax(0,75%),minmax(0,25%)] flex-col gap-x-6 px-4 sm:px-5 md:px-6 min-[1200px]:px-8 xl:px-10 max-[1199px]:flex">
        <div className="mt-[15px] flex w-full min-w-0 flex-col gap-y-7">
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
    </div>
  );
}
