'use client';
import website_name from '@/config/website';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useWatchPageEffects = (
  hasAppliedSavedEpisodeRef: React.RefObject<boolean>,
  animeId: string,
  setEpisodeId: (item: string) => void,
  episodeId: string | null,
  episodes: EpisodesTypes[] | null,
  urlEp: string | undefined,
  isFirstSet: React.RefObject<boolean>,
  serverLoading: boolean,
  buffering: boolean,
  streamUrl: string | null,
  animeInfo: AnimeData | null,
  nextEpisodeSchedule: NextEpisodeScheduleResult | null,
  errorBlockTimerRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
  setShowErrorBlock: (item: boolean) => void,
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
        episodes.some((ep) => getEpisodeNumberFromId(ep.id) === savedId)
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

    const isValidEpisode = episodes.some(
      (ep) => getEpisodeNumberFromId(ep.id) === episodeId
    );

    if (!episodeId || !isValidEpisode) {
      const fallbackId = getEpisodeNumberFromId(episodes[0].id);
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
    nextEpisodeSchedule?.nextEpisodeSchedule,
  ]);
};
