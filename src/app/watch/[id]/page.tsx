// @ts-nocheck
'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { useWatch } from '@/hooks/useWatch';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { BouncingLoader } from '@/components/ui/Bouncingloader/Bouncingloader';
import { Player } from '@/components/Player/Player';
import { Episodelist } from '@/components/Episodelist/Episodelist';
import website_name from '@/config/website';
import { Seasons } from '@/components/Seasons/Seasons';
import {
  faClosedCaptioning,
  faMicrophone,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimeSection } from '@/components/AnimeSection/AnimeSection';
import { AnimeSectionSkeleton } from '@/components/ui/Skeleton/AnimeSectionSkeleton';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import WatchControls from '@/components/Watchcontrols/Watchcontrols';
import { useWatchPageEffects } from '@/hooks/useWatchPageEffects';
import type { TagItem } from '@/shared/types/WatchPageTypes';
import { WatchTags } from '@/components/WatchTags/WatchTags';

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
  const [posterImageLoaded, setPosterImageLoaded] = useState(false);
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
    seasons,
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
    seasons,
    nextEpisodeSchedule,
    showNextEpisodeSchedule,
    errorBlockTimerRef,
    setShowErrorBlock,
    posterImgRef,
    setPosterImageLoaded,
    playerColumnRef,
    setEpisodesColumnHeight
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
            className="watch-player flex w-full min-w-0 flex-col gap-0 overflow-x-hidden max-[1200px]:order-1"
          >
            <div className="player relative h-[480px] w-full shrink-0 overflow-hidden rounded-xl border border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] max-[1400px]:h-[40vw] max-[1200px]:h-[48vw] max-[1024px]:h-[58vw] max-[600px]:h-[65vw]">
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
                  playNext={(id) => setEpisodeId(id)}
                  onEpisodeWatched={(id) => {
                    const epId = id != null ? String(id) : '';
                    if (!epId) return;
                    try {
                      setWatchedEpisodes((prev) => ({
                        ...(typeof prev === 'object' &&
                        prev &&
                        !Array.isArray(prev)
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
                  }}
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

            {(seasons?.length > 0 ||
              (nextEpisodeSchedule?.nextEpisodeSchedule &&
                showNextEpisodeSchedule)) && (
              <div className="mt-4 flex w-full min-w-0 flex-col gap-4 overflow-hidden">
                {seasons && seasons.length > 0 && (
                  <div className="flex w-full min-w-0 flex-col gap-y-2 overflow-hidden rounded-xl border border-white/5 bg-[#23252b]/80 p-4 shadow-[0_6px_25px_rgba(0,0,0,0.3)] backdrop-blur-md">
                    <h2 className="w-fit shrink-0 text-lg font-semibold max-[478px]:text-base">
                      Watch more seasons of this anime
                    </h2>
                    <div className="w-full min-w-0 overflow-hidden">
                      {animeInfoLoading ? (
                        <div className="grid w-full max-w-full grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="min-h-[100px] w-full min-w-0 overflow-hidden rounded-xl bg-white/10"
                            >
                              <Skeleton className="h-full w-full rounded-xl" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Seasons seasons={seasons} />
                      )}
                    </div>
                  </div>
                )}
                {nextEpisodeSchedule?.nextEpisodeSchedule &&
                  showNextEpisodeSchedule && (
                    <div className="w-full min-w-0 rounded-xl border border-white/5 bg-[#23252b]/80 p-4 shadow-[0_6px_25px_rgba(0,0,0,0.3)] backdrop-blur-md">
                      <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-md bg-[#ff640a] px-3 py-2 sm:px-4">
                        <p className="min-w-0 flex-1 text-sm leading-snug sm:text-[13.4px]">
                          <span className="mr-1" aria-hidden>
                            🚀
                          </span>
                          {' Estimated the next episode will come at '}
                          <span className="font-medium">
                            {new Date(
                              new Date(
                                nextEpisodeSchedule.nextEpisodeSchedule
                              ).getTime() -
                                new Date().getTimezoneOffset() * 60000
                            ).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </p>
                        <button
                          type="button"
                          className="shrink-0 rounded p-1 text-[#80C4E6] transition hover:bg-white/10 focus:ring-2 focus:ring-white/30 focus:outline-none"
                          onClick={() => setShowNextEpisodeSchedule(false)}
                          aria-label="Close"
                        >
                          <span className="text-xl leading-none font-extrabold">
                            ×
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
          <div className="watch-info flex min-h-0 min-w-0 flex-col items-start gap-y-4 self-start overflow-hidden rounded-xl border border-white/5 bg-[#23252b]/80 px-4 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md max-[1200px]:order-3 max-[1024px]:mt-4 max-[1024px]:px-[30px] max-[500px]:mt-4 max-[500px]:px-4 md:px-6 lg:px-10">
            <div className="relative h-[150px] w-[100px] shrink-0 overflow-hidden rounded-md max-[500px]:h-[90px] max-[500px]:w-[70px]">
              {animeInfo?.poster && (
                <img
                  ref={posterImgRef}
                  src={animeInfo.poster}
                  alt="Poster"
                  loading="eager"
                  fetchPriority="high"
                  className={`h-full w-full object-cover transition-opacity duration-200 ${posterImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setPosterImageLoaded(true)}
                />
              )}
              {(!animeInfo?.poster || !posterImageLoaded) && (
                <Skeleton className="absolute inset-0 h-full w-full rounded-md" />
              )}
            </div>
            <div className="flex min-w-0 flex-col justify-start gap-y-4 overflow-hidden">
              {animeInfo && animeInfo?.title ? (
                <p className="shrink-0 text-[26px] leading-6 font-medium max-[500px]:text-[18px]">
                  {animeInfo?.title}
                </p>
              ) : (
                <Skeleton className="h-[26px] max-w-[180px] shrink-0 rounded max-[500px]:h-[20px]" />
              )}

              <WatchTags animeInfo={animeInfo} />
              {animeInfo?.animeInfo?.Overview ? (
                <div className="mt-0 max-h-[200px] min-w-0 overflow-hidden">
                  <div className="no-scrollbar mt-2 max-h-[160px] overflow-y-auto">
                    <p className="text-[14px] font-[400]">
                      {animeInfo?.animeInfo?.Overview.length > 270 ? (
                        <>
                          {isFullOverview
                            ? animeInfo?.animeInfo?.Overview
                            : `${animeInfo?.animeInfo?.Overview.slice(
                                0,
                                270
                              )}...`}
                          <span
                            className="text-[13px] font-bold hover:cursor-pointer"
                            onClick={() => setIsFullOverview(!isFullOverview)}
                          >
                            {isFullOverview ? '- Less' : '+ More'}
                          </span>
                        </>
                      ) : (
                        <span>{animeInfo?.animeInfo?.Overview}</span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex flex-col gap-y-2">
                  <Skeleton className="h-[120px] w-full max-w-[510px] shrink-0 rounded" />
                </div>
              )}

              {animeInfo ? (
                <p className="shrink-0 text-[14px] max-[575px]:hidden">
                  {`${website_name} is the best site to watch `}
                  <span className="font-bold">{animeInfo.title}</span>
                  {` SUB online, or you can even watch `}
                  <span className="font-bold">{animeInfo.title}</span>
                  {` DUB in HD quality.`}
                </p>
              ) : (
                <Skeleton className="h-[144px] w-full max-w-[510px] shrink-0 rounded max-[575px]:hidden" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-[minmax(0,75%),minmax(0,25%)] flex-col gap-x-6 max-[1200px]:flex">
        <div className="mt-[15px] flex flex-col gap-y-7">
          {animeInfo?.recommended_data.length > 0 ? (
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
