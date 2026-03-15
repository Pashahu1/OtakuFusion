// @ts-nocheck
'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { useWatch } from '@/hooks/useWatch';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { BouncingLoader } from '@/components/ui/Bouncingloader/Bouncingloader';
import { Player } from '@/components/Player/Player';
import { Episodelist } from '@/components/Episodelist/Episodelist';
import { AnimeSection } from '@/components/AnimeSection/AnimeSection';
import { AnimeSectionSkeleton } from '@/components/ui/Skeleton/AnimeSectionSkeleton';
import { useWatchPageEffects } from '@/hooks/useWatchPageEffects';
import { WatchInfoPanel } from '@/components/WatchInfoPanel/WatchInfoPanel';

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
  const initialEpRef = useRef<{ animeId: string; ep: string | undefined }>({
    animeId: '',
    ep: undefined,
  });
  if (initialEpRef.current.animeId !== animeId) {
    initialEpRef.current = { animeId, ep: urlEp };
  }
  const initialEpisodeId = initialEpRef.current.ep;
  const [showNextEpisodeSchedule, setShowNextEpisodeSchedule] = useState(true);
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
    error,
    buffering,
    streamInfo,
    animeInfo,
    episodes,
    nextEpisodeSchedule,
    animeInfoLoading,
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
  } = useWatch(animeId, initialEpisodeId);

  const playerMountKey = useId();
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
    showNextEpisodeSchedule,
    errorBlockTimerRef,
    setShowErrorBlock,
    playerColumnRef,
    setEpisodesColumnHeight
  );

  const onEpisodeWatched = useCallback(
    (id: string) => {
      const epId = id != null ? String(id) : '';
      if (!epId) return;
      try {
        setWatchedEpisodes((prev) => ({
          ...(typeof prev === 'object' && prev && !Array.isArray(prev)
            ? prev
            : {}),
          [epId]: true,
        }));
      } catch (e) {
        if (
          typeof process !== 'undefined' &&
          process.env.NODE_ENV === 'development'
        ) {
          console.warn('Failed to save watched episode:', e);
        }
      }
    },
    [setWatchedEpisodes]
  );

  const isErrorState = !serverLoading && !buffering && !streamUrl;

  return (
    <div className="relative flex h-fit w-full flex-col items-center justify-center">
      <div className="relative w-full px-4 max-[1400px]:px-[30px] max-[1200px]:px-[80px] max-[1024px]:px-0 lg:px-10">
        <div className="watch-layout relative z-10 mt-[128px] grid w-full grid-cols-[minmax(280px,28%)_1fr_minmax(240px,22%)] gap-4 pb-[50px] max-[1200px]:mt-[64px] max-[1200px]:grid-cols-1 max-[1200px]:grid-rows-[auto_auto_auto] max-[1024px]:px-0 max-md:mt-[50px]">
          <div
            className="watch-episodes episodes flex min-h-[480px] min-w-0 flex-col overflow-hidden rounded-xl border border-white/5 bg-[#23252b]/80 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md max-[1200px]:order-2 max-[1200px]:min-h-[280px]"
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
                animeId={animeId}
                episodes={episodes}
                currentEpisode={episodeId}
                onEpisodeClick={(id) => setEpisodeId(id)}
                totalEpisodes={totalEpisodes}
                watchedEpisodes={watchedEpisodes}
              />
            )}
          </div>
          <div
            ref={playerColumnRef}
            className="watch-player flex h-full w-full min-w-0 flex-col gap-0 overflow-x-hidden max-[1200px]:order-1"
          >
            <div className="player relative h-[480px] h-full w-full shrink-0 overflow-hidden rounded-xl border border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] max-[1400px]:h-[40vw] max-[1200px]:h-[48vw] max-[1024px]:h-[58vw] max-[600px]:h-[65vw]">
              {(serverLoading || buffering) && (
                <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
                  <BouncingLoader />
                </div>
              )}

              {!serverLoading && !buffering && streamUrl && (
                <Player
                  key={playerMountKey}
                  streamUrl={streamUrl}
                  subtitles={subtitles}
                  intro={intro}
                  outro={outro}
                  thumbnail={thumbnail}
                  episodeId={episodeId}
                  episodes={episodes}
                  playNext={onEpisodeWatched}
                  animeInfo={animeInfo}
                  episodeNum={activeEpisodeNum}
                  streamInfo={streamInfo}
                  servers={servers}
                  activeServerId={activeServerId}
                  setActiveServerId={setActiveServerId}
                />
              )}

              {showErrorBlock && isErrorState && (
                <div className="bg-opacity-50 absolute inset-0 flex flex-col items-center justify-center bg-black text-center">
                  <img
                    src="/gojo-player.png"
                    alt="gojo"
                    className="w-[100px]"
                  />
                  <span>Servers now is not Available</span>
                  <span>Please try again later or change Server below</span>
                </div>
              )}
            </div>
          </div>
          <WatchInfoPanel
            animeInfo={animeInfo}
            nextEpisodeSchedule={nextEpisodeSchedule}
            posterImgRef={posterImgRef}
            isFullOverview={isFullOverview}
            setIsFullOverview={setIsFullOverview}
          />
        </div>
      </div>

      <div className="grid w-full grid-cols-[minmax(0,75%),minmax(0,25%)] flex-col gap-x-6 max-[1200px]:flex">
        <div className="mt-[15px] flex flex-col gap-y-7">
          {(animeInfo?.recommended_data?.length ?? 0) > 0 ? (
            <AnimeSection
              title="Recommended for you"
              catalog={animeInfo?.recommended_data}
            />
          ) : (
            <AnimeSectionSkeleton title="Recommended for you" />
          )}
        </div>
      </div>
    </div>
  );
}
