'use client';

import { useEffect, useRef } from 'react';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';

const MEGAPLAY_ORIGIN = 'https://megaplay.buzz';

type MegaplayEvent =
  | { event: 'time'; time: number; duration: number; percent: number }
  | { event: 'complete' }
  | { event: 'error'; message?: string }
  | { type: 'watching-log'; currentTime: number; duration: number };

interface IframePlayerProps {
  iframeUrl: string;
  episodeId: string | null;
  episodes: EpisodesTypes[] | null;
  playNext: (episodeId: string) => void;
  onEpisodeWatched?: ((episodeId: string) => void) | null;
  onExternalError?: (message?: string) => void;
}

function parseMessage(raw: unknown): MegaplayEvent | null {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as MegaplayEvent;
    } catch {
      return null;
    }
  }
  if (raw && typeof raw === 'object') return raw as MegaplayEvent;
  return null;
}

function getNextEpisodeId(
  episodes: EpisodesTypes[] | null,
  currentEpisodeId: string | null
): string | null {
  if (!episodes?.length || !currentEpisodeId) return null;
  const idx = episodes.findIndex((ep) => {
    const epNum = getEpisodeNumberFromId(ep.id);
    return epNum === currentEpisodeId || String(ep.data_id) === currentEpisodeId;
  });
  if (idx < 0) return null;
  const next = episodes[idx + 1];
  if (!next) return null;
  return getEpisodeNumberFromId(next.id) ?? String(next.data_id);
}

export function IframePlayer({
  iframeUrl,
  episodeId,
  episodes,
  playNext,
  onEpisodeWatched,
  onExternalError,
}: IframePlayerProps) {
  const episodeIdRef = useRef(episodeId);
  const episodesRef = useRef(episodes);
  const playNextRef = useRef(playNext);
  const onWatchedRef = useRef(onEpisodeWatched);
  const onErrorRef = useRef(onExternalError);
  const completedRef = useRef(false);

  useEffect(() => {
    episodeIdRef.current = episodeId;
    episodesRef.current = episodes;
    playNextRef.current = playNext;
    onWatchedRef.current = onEpisodeWatched;
    onErrorRef.current = onExternalError;
  });

  useEffect(() => {
    completedRef.current = false;
  }, [iframeUrl, episodeId]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== MEGAPLAY_ORIGIN) return;
      const data = parseMessage(event.data);
      if (!data) return;

      if ('event' in data) {
        if (data.event === 'complete' && !completedRef.current) {
          completedRef.current = true;
          const currentId = episodeIdRef.current;
          if (currentId) onWatchedRef.current?.(currentId);
          const nextId = getNextEpisodeId(episodesRef.current, currentId);
          if (nextId) playNextRef.current?.(nextId);
          return;
        }
        if (data.event === 'error') {
          onErrorRef.current?.(data.message);
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <iframe
      src={iframeUrl}
      className="h-full w-full border-0"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      referrerPolicy="origin"
      title="External player"
    />
  );
}
