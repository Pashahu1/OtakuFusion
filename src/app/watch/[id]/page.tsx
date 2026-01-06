// @ts-nocheck
'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import useWatch from '@/hooks/useWatch.ts';
import { BouncingLoader } from '@/components/ui/Bouncingloader/Bouncingloader';
import Player from '@/components/Player/Player';
import Episodelist from '@/components/Episodelist/Episodelist';
import website_name from '@/config/website';
import { Seasons } from '@/components/Seasons/Seasons';
import {
  faClosedCaptioning,
  faMicrophone,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Servers from '@/components/Servers/Servers';
// import CategoryCardLoader from '@/src/components/Loader/CategoryCard.loader';
// import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import Voiceactor from '@/components/Voiceactor/Voiceactor';
// import Watchcontrols from '@/components/Watchcontrols/Watchcontrols';
// import useWatchControl from '@/hooks/useWatchControl';
import AnimeSection from '@/components/AnimeSection/AnimeSection';
import { AnimeSectionSkeleton } from '@/components/ui/Skeleton/AnimeSectionSkeleton';
import WatchControls from '@/components/Watchcontrols/Watchcontrols';

export default function Watch() {
  const pathname = usePathname();
  const router = useRouter();
  const { id: animeId } = useParams();
  const queryParams = new URLSearchParams(pathname.search);
  let initialEpisodeId = queryParams.get('ep');
  const [tags, setTags] = useState([]);
  const isFirstSet = useRef(true);
  const [showNextEpisodeSchedule, setShowNextEpisodeSchedule] = useState(true);
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

  // const {
  //   autoPlay,
  //   setAutoPlay,
  //   autoSkipIntro,
  //   setAutoSkipIntro,
  //   autoNext,
  //   setAutoNext,
  // } = useWatchControl();

  useEffect(() => {
    if (!episodes || episodes.length === 0) return;

    const isValidEpisode = episodes.some((ep) => {
      const epNumber = ep.id.split('ep=')[1];
      return epNumber === episodeId;
    });

    // If missing or invalid episodeId, fallback to first
    if (!episodeId || !isValidEpisode) {
      const fallbackId = episodes[0].id.match(/ep=(\d+)/)?.[1];
      if (fallbackId && fallbackId !== episodeId) {
        setEpisodeId(fallbackId);
      }
      return;
    }

    const newUrl = `/watch/${animeId}?ep=${episodeId}`;
    if (isFirstSet.current) {
      router.push(newUrl, { replace: true });
      isFirstSet.current = false;
    } else {
      router.push(newUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, animeId, router, episodes]);

  // Update document title
  useEffect(() => {
    if (animeInfo) {
      document.title = `Watch ${animeInfo.title} English Sub/Dub online Free on ${website_name}`;
    }
    return () => {
      document.title = `${website_name} | Free anime streaming platform`;
    };
  }, [animeId]);

  // Redirect if no episodes
  useEffect(() => {
    if (totalEpisodes !== null && totalEpisodes === 0) {
      router.push(`/${animeId}`);
    }
  }, [streamInfo, episodeId, animeId, totalEpisodes, router, servers]);

  useEffect(() => {
    const adjustHeight = () => {
      if (window.innerWidth > 1200) {
        const player = document.querySelector('.player');
        const episodes = document.querySelector('.episodes');
        if (player && episodes) {
          episodes.style.height = `${player.clientHeight}px`;
        }
      } else {
        const episodes = document.querySelector('.episodes');
        if (episodes) {
          episodes.style.height = 'auto';
        }
      }
    };
    adjustHeight();
    window.addEventListener('resize', adjustHeight);
    return () => {
      window.removeEventListener('resize', adjustHeight);
    };
  });

  function Tag({ bgColor, index, icon, text }) {
    return (
      <div
        className={`flex space-x-1 justify-center items-center px-[4px] py-[1px] text-black font-semibold text-[13px] ${
          index === 0 ? 'rounded-l-[4px]' : 'rounded-none'
        }`}
        style={{ backgroundColor: bgColor }}
      >
        {icon && <FontAwesomeIcon icon={icon} className="text-[12px]" />}
        <p className="text-[12px]">{text}</p>
      </div>
    );
  }

  useEffect(() => {
    setTags([
      {
        condition: animeInfo?.animeInfo?.tvInfo?.rating,
        bgColor: '#ffffff',
        text: animeInfo?.animeInfo?.tvInfo?.rating,
      },
      {
        condition: animeInfo?.animeInfo?.tvInfo?.quality,
        bgColor: '#FFBADE',
        text: animeInfo?.animeInfo?.tvInfo?.quality,
      },
      {
        condition: animeInfo?.animeInfo?.tvInfo?.sub,
        icon: faClosedCaptioning,
        bgColor: '#B0E3AF',
        text: animeInfo?.animeInfo?.tvInfo?.sub,
      },
      {
        condition: animeInfo?.animeInfo?.tvInfo?.dub,
        icon: faMicrophone,
        bgColor: '#B9E7FF',
        text: animeInfo?.animeInfo?.tvInfo?.dub,
      },
    ]);
  }, [animeId, animeInfo]);

  return (
    <div className="w-full h-fit flex flex-col justify-center items-center relative">
      <div className="w-full relative max-[1400px]:px-[30px] max-[1200px]:px-[80px] max-[1024px]:px-0">
        <img
          src={
            !animeInfoLoading
              ? `${animeInfo?.poster}`
              : 'https://i.postimg.cc/rFZnx5tQ/2-Kn-Kzog-md.webp'
          }
          alt={`${animeInfo?.title} Poster`}
          className="absolute inset-0 w-full h-full object-cover filter grayscale z-[-900]"
        />
        {/* <div className="absolute inset-0 bg-[#3a3948] bg-opacity-80 backdrop-blur-md z-[-800]"></div> */}
        <div className="relative z-10 px-4 pb-[50px] grid grid-cols-[3fr_1fr] w-full h-full mt-[128px] max-[1400px]:flex max-[1400px]:flex-col max-[1200px]:grid-cols-[2fr_1fr] max-[1200px]:mt-[64px] max-[1024px]:px-0 max-md:mt-[50px]">
          <div className="flex w-full min-h-fit max-[1200px]:flex-col-reverse">
            <div className="episodes w-[35%] bg-[#191826] flex justify-center items-center max-[1400px]:w-[380px] max-[1200px]:w-full max-[1200px]:h-full max-[1200px]:min-h-[100px]">
              {!episodes ? (
                <BouncingLoader />
              ) : (
                <Episodelist
                  episodes={episodes}
                  currentEpisode={episodeId}
                  onEpisodeClick={(id) => setEpisodeId(id)}
                  totalEpisodes={totalEpisodes}
                />
              )}
            </div>
            <div className="player w-full h-fit bg-black flex flex-col">
              <div className="w-full relative h-[480px] max-[1400px]:h-[40vw] max-[1200px]:h-[48vw] max-[1024px]:h-[58vw] max-[600px]:h-[65vw]">
                {!buffering ? (
                  <Player
                    streamUrl={streamUrl}
                    subtitles={subtitles}
                    intro={intro}
                    outro={outro}
                    thumbnail={thumbnail}
                    // autoSkipIntro={autoSkipIntro}
                    // autoPlay={autoPlay}
                    // autoNext={autoNext}
                    episodeId={episodeId}
                    episodes={episodes}
                    playNext={(id) => setEpisodeId(id)}
                    animeInfo={animeInfo}
                    episodeNum={activeEpisodeNum}
                    streamInfo={streamInfo}
                  />
                ) : (
                  <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <BouncingLoader />
                  </div>
                )}
                {streamUrl === null && !buffering && (
                  <div className="absolute inset-0 flex flex-col justify-center text-center items-center bg-black bg-opacity-50">
                    <img
                      src="/gojo-player.png"
                      alt="gojo"
                      className="w-[100px]"
                    />
                    <span>Servers now is not Available</span>
                    <span className="text-center">Please try again later</span>
                  </div>
                )}

                {/* <p className="text-center underline font-medium text-[15px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  {!buffering && !streamInfo ? (
                    servers ? (
                      <>
                        Probably this server is down, try other servers
                        <br />
                        Either reload or try again after sometime
                      </>
                    ) : (
                      <>
                        Probably streaming server is down
                        <br />
                        Either reload or try again after sometime
                      </>
                    )
                  ) : null}
                </p> */}
              </div>

              {/* {!buffering && (
                <WatchControls
                  autoPlay={autoPlay}
                  setAutoPlay={setAutoPlay}
                  autoSkipIntro={autoSkipIntro}
                  setAutoSkipIntro={setAutoSkipIntro}
                  autoNext={autoNext}
                  setAutoNext={setAutoNext}
                  episodes={episodes}
                  totalEpisodes={totalEpisodes}
                  episodeId={episodeId}
                  onButtonClick={(id) => setEpisodeId(id)}
                />
              )} */}
              <Servers
                servers={servers}
                activeEpisodeNum={activeEpisodeNum}
                activeServerId={activeServerId}
                setActiveServerId={setActiveServerId}
                serverLoading={serverLoading}
              />
              {seasons?.length > 0 && (
                <div className="flex flex-col gap-y-2 bg-[#11101A] p-4">
                  <h1 className="w-fit text-lg max-[478px]:text-[18px] font-semibold">
                    Watch more seasons of this anime
                  </h1>
                  <div className="flex flex-wrap gap-4">
                    <Seasons seasons={seasons} />
                  </div>
                </div>
              )}
              {nextEpisodeSchedule?.nextEpisodeSchedule &&
                showNextEpisodeSchedule && (
                  <div className="p-4 bg-[#11101A]">
                    <div className="w-full px-4 rounded-md bg-[#0088CC] flex items-center justify-between gap-x-2">
                      <div className="w-full h-fit">
                        <span className="text-[18px]">🚀</span>
                        {' Estimated the next episode will come at '}
                        <span className="text-[13.4px] font-medium">
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
                      </div>
                      <span
                        className="text-[25px] h-fit font-extrabold text-[#80C4E6] mb-1 cursor-pointer"
                        onClick={() => setShowNextEpisodeSchedule(false)}
                      >
                        ×
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </div>
          <div className="flex flex-col items-start gap-y-4 ml-8 bg-[#201F31] max-[1400px]:ml-0 max-[1400px]:mt-10 max-[1400px]:flex-row max-[1400px]:gap-x-6 max-[1024px]:px-[30px] max-[1024px]:mt-8 max-[500px]:mt-4 max-[500px]:px-4 px-4 md:px-6 lg:px-10 py-8">
            {animeInfo && animeInfo?.poster ? (
              <img
                src={`${animeInfo?.poster}`}
                alt=""
                className="w-[100px] h-[150px] object-cover max-[500px]:w-[70px] max-[500px]:h-[90px]"
              />
            ) : (
              <></>
              // <Skeleton className="w-[100px] h-[150px] rounded-none" />
            )}
            <div className="flex flex-col gap-y-4 justify-start">
              {animeInfo && animeInfo?.title ? (
                <p className="text-[26px] font-medium leading-6 max-[500px]:text-[18px]">
                  {animeInfo?.title}
                </p>
              ) : (
                <></>
              )}
              <div className="flex flex-wrap w-fit gap-x-[2px] gap-y-[3px]">
                {animeInfo ? (
                  tags.map(
                    ({ condition, icon, bgColor, text }, index) =>
                      condition && (
                        <Tag
                          key={index}
                          index={index}
                          bgColor={bgColor}
                          icon={icon}
                          text={text}
                        />
                      )
                  )
                ) : (
                  <></>
                )}
                <div className="flex w-fit items-center ml-1">
                  {[
                    animeInfo?.animeInfo?.tvInfo?.showType,
                    animeInfo?.animeInfo?.tvInfo?.duration,
                  ].map(
                    (item, index) =>
                      item && (
                        <div
                          key={index}
                          className="px-1 h-fit flex items-center gap-x-2 w-fit"
                        >
                          <div className="dot mt-[2px]"></div>
                          <p className="text-[14px]">{item}</p>
                        </div>
                      )
                  )}
                </div>
              </div>
              {animeInfo ? (
                animeInfo?.animeInfo?.Overview && (
                  <div className="max-h-[150px] overflow-hidden">
                    <div className="max-h-[110px] mt-2 overflow-y-auto">
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
                          animeInfo?.animeInfo?.Overview
                        )}
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-y-2"></div>
              )}
              <p className="text-[14px] max-[575px]:hidden">
                {`${website_name} is the best site to watch `}
                <span className="font-bold">{animeInfo?.title}</span>
                {` SUB online, or you can even watch `}
                <span className="font-bold">{animeInfo?.title}</span>
                {` DUB in HD quality.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 grid grid-cols-[minmax(0,75%),minmax(0,25%)] gap-x-6 max-[1200px]:flex flex-col">
        <div className="mt-[15px] flex flex-col gap-y-7">
          {animeInfo?.charactersVoiceActors.length > 0 && (
            <Voiceactor animeInfo={animeInfo} className="!mt-0" />
          )}
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
