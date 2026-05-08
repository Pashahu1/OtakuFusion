'use client';
import { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

import './Player.scss';
import type { PlayerProps } from '@/shared/types/PlayerTypes';
import { PLAYER_THEME_COLOR } from './playerConstants';

import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { getStreamFullUrl, getStreamHeaders } from './playerStream';
import { useChapterStyles } from '@/hooks/useChapterStyles';
import { getArtplayerOptions } from './getArtplayerOptions';
import { setupPlayerReady } from './setupPlayerReady';
import {
  removeFromContinueWatching,
  updateContinueWatching,
} from './updateContinueWatching';

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

function isHardHttpFailure(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as { response?: { code?: unknown } };
  const code = typeof d.response?.code === 'number' ? d.response.code : null;
  return code != null && code >= 400 && code < 500;
}

function getPreferred720LevelIndex(levels: Array<{ height?: number }>): number {
  if (!levels.length) return -1;
  const withHeight = levels
    .map((level, index) => ({ index, height: Number(level.height ?? 0) }))
    .filter((item) => Number.isFinite(item.height) && item.height > 0);
  if (!withHeight.length) return levels.length - 1;

  const atOrBelow720 = withHeight
    .filter((item) => item.height <= 720)
    .sort((a, b) => b.height - a.height);
  if (atOrBelow720.length) return atOrBelow720[0].index;

  const above720 = withHeight.sort((a, b) => a.height - b.height);
  return above720[0].index;
}

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
  onPlaybackError,
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
  const onPlaybackErrorRef = useRef(onPlaybackError);
  const animeInfoRef = useRef(animeInfo);
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
    onPlaybackErrorRef.current = onPlaybackError;
    animeInfoRef.current = animeInfo;
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

    const headers = getStreamHeaders(streamInfo, streamUrl);
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
        () => currentEpisodeIndexRef.current ?? -1,
        () => episodesRef.current ?? [],
        playNext,
        userPausedRef
      ),
    });

    let hasStartedPlaying = false;
    let hasReportedError = false;
    let hlsRecoverNetworkTried = false;
    let hlsRecoverMediaTried = false;
    const reportError = () => {
      if (hasReportedError) return;
      hasReportedError = true;
      try {
        if (art.hls) {
          art.hls.stopLoad();
          art.hls.destroy();
          art.hls = null;
        }
      } catch {
        /* noop */
      }
      onPlaybackErrorRef.current?.();
    };
    art.on('video:playing', () => {
      hasStartedPlaying = true;
    });
    art.on('video:canplay', () => {
      hasStartedPlaying = true;
    });

    if (art.hls) {
      art.hls.on(
        Hls.Events.ERROR,
        (_evt: unknown, data: { fatal?: boolean; type?: string; response?: { code?: number } }) => {
          if (data?.type === Hls.ErrorTypes.NETWORK_ERROR && isHardHttpFailure(data)) {
            reportError();
            return;
          }
          if (data?.fatal && art.hls) {
            if (
              data.type === Hls.ErrorTypes.NETWORK_ERROR &&
              !hlsRecoverNetworkTried
            ) {
              hlsRecoverNetworkTried = true;
              try {
                art.hls.startLoad();
                return;
              } catch {
                /* fall through to reportError */
              }
            }
            if (
              data.type === Hls.ErrorTypes.MEDIA_ERROR &&
              !hlsRecoverMediaTried
            ) {
              hlsRecoverMediaTried = true;
              try {
                art.hls.recoverMediaError();
                return;
              } catch {
                /* fall through */
              }
            }
            reportError();
            return;
          }
          if (
            !hasStartedPlaying &&
            data?.type === Hls.ErrorTypes.NETWORK_ERROR
          ) {
            reportError();
          }
        }
      );
    }
    art.on('video:error', reportError);
    art.on('error', reportError);

    art.on('resize', () => {
      if ((art as Artplayer & { __subtitleResizeRaf?: number }).__subtitleResizeRaf) {
        cancelAnimationFrame(
          (art as Artplayer & { __subtitleResizeRaf?: number }).__subtitleResizeRaf as number
        );
      }
      (art as Artplayer & { __subtitleResizeRaf?: number }).__subtitleResizeRaf =
        requestAnimationFrame(() => {
          art.subtitle.style({
            fontSize:
              (art.width > 500 ? art.width * 0.02 : art.width * 0.03) + 'px',
          });
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
        return;
      }
      const info = animeInfoRef.current;
      if (
        info?.id &&
        info.data_id != null &&
        list &&
        list.length > 0 &&
        idx >= 0
      ) {
        removeFromContinueWatching(info.id, info.data_id);
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
        streamInfo?.streamingLink?.[0]?.type ?? null,
        serversRef,
        activeServerIdRef
      );
      updateContinueWatching(animeInfo, episodeId, episodeNum);

      const plugins = art.plugins as unknown as {
        artplayerPluginHlsControl?: { update?: () => void };
      };
      const syncHlsQualityUi = () => {
        plugins.artplayerPluginHlsControl?.update?.();
      };
      const applyDefault720Quality = () => {
        if (!hlsInstance.levels?.length) return;
        const targetLevelIndex = getPreferred720LevelIndex(
          hlsInstance.levels as Array<{ height?: number }>
        );
        if (targetLevelIndex < 0) return;

        // Фіксуємо стартову якість на 720p (або найближчу доступну),
        // щоб користувач не перемикав вручну на кожному епізоді.
        hlsInstance.currentLevel = targetLevelIndex;
        hlsInstance.nextLevel = targetLevelIndex;
        hlsInstance.loadLevel = targetLevelIndex;
      };
      const hlsInstance = art.hls;
      if (hlsInstance) {
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, applyDefault720Quality);
        hlsInstance.on(Hls.Events.LEVEL_SWITCHED, syncHlsQualityUi);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, syncHlsQualityUi);
        applyDefault720Quality();
        syncHlsQualityUi();
        art.on('destroy', () => {
          hlsInstance.off(Hls.Events.MANIFEST_PARSED, applyDefault720Quality);
          hlsInstance.off(Hls.Events.LEVEL_SWITCHED, syncHlsQualityUi);
          hlsInstance.off(Hls.Events.MANIFEST_PARSED, syncHlsQualityUi);
        });
      }
    });

    artInstanceRef.current = art;

    return () => {
      const instanceToDestroy = artInstanceRef.current === art ? art : null;
      if (instanceToDestroy) {
        artInstanceRef.current = null;
        try {
          const resizeRaf = (instanceToDestroy as Artplayer & { __subtitleResizeRaf?: number })
            .__subtitleResizeRaf;
          if (resizeRaf) {
            cancelAnimationFrame(resizeRaf);
            (instanceToDestroy as Artplayer & { __subtitleResizeRaf?: number })
              .__subtitleResizeRaf = undefined;
          }
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
