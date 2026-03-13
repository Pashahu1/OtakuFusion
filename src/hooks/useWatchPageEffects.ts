'use client';
import website_name from '@/config/website';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type {
  AnimeInfo,
  NextEpisodeScheduleResult,
  SeasonsTypes,
} from '@/shared/types/GlobalAnimeTypes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useWatchPageEffects = (
  hasAppliedSavedEpisodeRef: React.RefObject<boolean>,
  animeId: string,
  setEpisodeId: (item: string) => void,
  episodeId: string,
  episodes: EpisodesTypes[],
  urlEp: string | undefined,
  isFirstSet: React.RefObject<boolean>,
  serverLoading: boolean,
  buffering: boolean,
  streamUrl: string,
  animeInfo: AnimeInfo,
  seasons: SeasonsTypes[],
  nextEpisodeSchedule: NextEpisodeScheduleResult,
  showNextEpisodeSchedule: boolean,
  errorBlockTimerRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
  setShowErrorBlock: (item: boolean) => void,
  posterImgRef: React.RefObject<HTMLImageElement | null>,
  setPosterImageLoaded: (item: boolean) => void,
  playerColumnRef: React.RefObject<HTMLDivElement | null>,
  setEpisodesColumnHeight: (height: number | null) => void
) => {
  const router = useRouter();
  useEffect(() => {
    hasAppliedSavedEpisodeRef.current = false;
  }, [animeId]);

  useEffect(() => {
    if (urlEp || !episodes?.length || hasAppliedSavedEpisodeRef.current) return;
    if (typeof window === 'undefined') return;
    hasAppliedSavedEpisodeRef.current = true;
    try {
      const cw = JSON.parse(localStorage.getItem('continueWatching') || '[]');
      const found = cw.find((x: { id: string }) => x.id === animeId);
      const savedId = found?.episodeId;
      if (
        savedId &&
        episodes.some((ep) => ep.id.match(/ep=(\d+)/)?.[1] === savedId)
      ) {
        setEpisodeId(savedId);
      }
    } catch {
      console.error('Error parsing continue watching data');
      return;
    }
  }, [animeId, episodes, setEpisodeId, urlEp]);

  useEffect(() => {
    if (!episodes || episodes.length === 0) return;

    const isValidEpisode = episodes.some((ep) => {
      const epNumber = ep.id.split('ep=')[1];
      return epNumber === episodeId;
    });

    if (!episodeId || !isValidEpisode) {
      const fallbackId = episodes[0].id.match(/ep=(\d+)/)?.[1];
      if (fallbackId && fallbackId !== episodeId) {
        setEpisodeId(fallbackId);
      }
      return;
    }

    const newUrl = `/watch/${animeId}?ep=${episodeId}`;
    if (isFirstSet.current) {
      router.replace(newUrl);
      isFirstSet.current = false;
    } else {
      router.push(newUrl);
    }
  }, [episodeId, animeId, router, episodes, setEpisodeId]);

  useEffect(() => {
    if (animeInfo) {
      document.title = `Watch ${animeInfo.title} English Sub/Dub online Free on ${website_name}`;
    }

    return () => {
      document.title = `${website_name} | Free anime streaming platform`;
    };
  }, [animeId, animeInfo]);

  const isErrorState = !serverLoading && !buffering && !streamUrl;
  useEffect(() => {
    if (isErrorState) {
      errorBlockTimerRef.current = setTimeout(
        () => setShowErrorBlock(true),
        400
      );
    } else {
      if (errorBlockTimerRef.current) {
        clearTimeout(errorBlockTimerRef.current);
        errorBlockTimerRef.current = null;
      }
      setShowErrorBlock(false);
    }
    return () => {
      if (errorBlockTimerRef.current) {
        clearTimeout(errorBlockTimerRef.current);
        errorBlockTimerRef.current = null;
      }
    };
  }, [isErrorState]);

  useEffect(() => {
    setPosterImageLoaded(false);
    if (!animeInfo?.poster) return;
    const checkCached = () => {
      if (posterImgRef.current?.complete) setPosterImageLoaded(true);
    };
    const t = setTimeout(checkCached, 0);
    return () => clearTimeout(t);
  }, [animeInfo?.poster]);

  useEffect(() => {
    const centerColumn = playerColumnRef.current;
    if (!centerColumn) return;

    const updateHeight = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth > 1200) {
        const h = centerColumn.clientHeight;
        setEpisodesColumnHeight(h > 0 ? h : null);
      } else {
        setEpisodesColumnHeight(null);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateHeight);
      ro.observe(centerColumn);
      return () => {
        ro.disconnect();
        window.removeEventListener('resize', updateHeight);
      };
    }
    return () => window.removeEventListener('resize', updateHeight);
  }, [
    setEpisodesColumnHeight,
    streamUrl,
    serverLoading,
    buffering,
    seasons?.length,
    nextEpisodeSchedule?.nextEpisodeSchedule,
    showNextEpisodeSchedule,
  ]);
};
