'use client';
import { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';

import './Player.scss';
import type { PlayerProps } from '@/shared/types/PlayerTypes';
import { PLAYER_THEME_COLOR } from './playerConstants';

import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { getStreamFullUrl, getStreamHeaders } from './playerStream';
import { useChapterStyles } from '@/hooks/useChapterStyles';
import { getArtplayerOptions } from './getArtplayerOptions';
import { setupPlayerReady } from './setupPlayerReady';
import { updateContinueWatching } from './updateContinueWatching';

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

export function Player({
  streamUrl,
  subtitles,
  thumbnail,
  intro,
  outro,
  episodeId,
  episodes,
  playNext,
  onEpisodeWatched,
  animeInfo,
  episodeNum,
  streamInfo,
  servers = null,
  activeServerId = null,
  setActiveServerId = () => {},
}: PlayerProps) {
  const currentEpisodeIndex =
    episodes?.findIndex(
      (episode) => getEpisodeNumberFromId(episode.id) === episodeId
    ) ?? -1;

  const artRef = useRef<HTMLDivElement>(null);
  const artInstanceRef = useRef<Artplayer | null>(null);
  const serversRef = useRef(servers);
  const activeServerIdRef = useRef(activeServerId);
  const episodeIdRef = useRef(episodeId);
  const episodesRef = useRef(episodes);
  const currentEpisodeIndexRef = useRef(currentEpisodeIndex);
  const playNextRef = useRef(playNext);
  const onEpisodeWatchedRef = useRef(onEpisodeWatched);
  const hasTriggeredNextRef = useRef(false);
  const hasMarkedWatchedForOutroRef = useRef(false);
  const userPausedRef = useRef(false);

  useEffect(() => {
    serversRef.current = servers;
    activeServerIdRef.current = activeServerId;
    episodeIdRef.current = episodeId;
    episodesRef.current = episodes;
    currentEpisodeIndexRef.current = currentEpisodeIndex;
    playNextRef.current = playNext;
    onEpisodeWatchedRef.current = onEpisodeWatched;
  });

  useEffect(() => {
    hasTriggeredNextRef.current = false;
    hasMarkedWatchedForOutroRef.current = false;
    userPausedRef.current = false;
  }, [episodeId, episodes]);

  useChapterStyles(streamUrl, intro, outro);

  useEffect(() => {
    if (!streamUrl || !artRef.current) return;
    const container = artRef.current;
    if (artInstanceRef.current) {
      const prev = artInstanceRef.current;
      if (prev.hls) {
        prev.hls.destroy();
        prev.hls = null;
      }
      if (prev.video) {
        prev.video.pause();
        prev.video.removeAttribute('src');
        prev.video.load();
      }
      prev.pause();
      prev.destroy(false);
      artInstanceRef.current = null;
    }

    container.innerHTML = '';

    const headers = getStreamHeaders(streamInfo);
    const fullURL = getStreamFullUrl(streamUrl, headers);

    const art = new Artplayer({
      url: fullURL,
      container,
      type: 'm3u8',
      autoplay: false,
      volume: 1,
      setting: true,
      playbackRate: true,
      pip: true,
      hotkey: false,
      fullscreen: true,
      mutex: true,
      playsInline: true,
      lock: true,
      airplay: true,
      autoOrientation: true,
      fastForward: true,
      aspectRatio: true,
      subtitleOffset: true,
      theme: PLAYER_THEME_COLOR,
      ...getArtplayerOptions(
        intro,
        outro,
        currentEpisodeIndex ?? 0,
        episodes ?? [],
        playNext,
        userPausedRef
      ),
    });

    art.on('resize', () => {
      art.subtitle.style({
        fontSize:
          (art.width > 500 ? art.width * 0.02 : art.width * 0.03) + 'px',
      });
    });

    art.on('video:ended', () => {
      const id = episodeIdRef.current;
      const list = episodesRef.current;
      const idx = currentEpisodeIndexRef.current ?? -1;
      const epId = id != null ? String(id) : '';
      if (epId) onEpisodeWatchedRef.current?.(epId);
      const next = list?.[idx + 1];
      if (next) {
        const nextId = getEpisodeNumberFromId(next.id);
        if (nextId) playNextRef.current?.(nextId);
      }
    });

    art.on('ready', () => {
      setupPlayerReady(
        art,
        playNextRef,
        episodeIdRef,
        thumbnail,
        episodesRef,
        currentEpisodeIndexRef,
        hasMarkedWatchedForOutroRef,
        hasTriggeredNextRef,
        onEpisodeWatchedRef,
        setActiveServerId,
        userPausedRef,
        artRef,
        intro,
        outro,
        subtitles,
        serversRef,
        activeServerIdRef
      );
      updateContinueWatching(animeInfo, episodeId, episodeNum);
    });

    artInstanceRef.current = art;

    return () => {
      const instanceToDestroy = artInstanceRef.current === art ? art : null;
      if (instanceToDestroy) {
        artInstanceRef.current = null;
        try {
          if (instanceToDestroy.hls) {
            instanceToDestroy.hls.destroy();
            instanceToDestroy.hls = null;
          }
          if (instanceToDestroy.video) {
            instanceToDestroy.video.pause();
            instanceToDestroy.video.removeAttribute('src');
            instanceToDestroy.video.load();
          }
          instanceToDestroy.pause();
          instanceToDestroy.destroy(false);
        } catch (e) {
          if (
            typeof process !== 'undefined' &&
            process.env.NODE_ENV === 'development'
          ) {
            console.warn('Player cleanup:', e);
          }
        }
        const container = artRef.current;
        if (container && typeof container.innerHTML !== 'undefined')
          container.innerHTML = '';
      }
    };
  }, [streamUrl, subtitles, intro, outro]);

  return <div ref={artRef} className="relative h-full w-full"></div>;
}
