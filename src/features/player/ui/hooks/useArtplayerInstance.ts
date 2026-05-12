'use client';

import { useEffect, useRef, useMemo } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

import { PLAYER_THEME_COLOR } from '../playerConstants';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { getStreamFullUrl, getStreamHeaders } from '../playerStream';
import { getArtplayerOptions } from '../getArtplayerOptions';
import { setupPlayerReady } from '../setupPlayerReady';
import {
  removeFromContinueWatching,
  updateContinueWatching,
} from '../updateContinueWatching';
import {
  attachHlsQualityPreferencePersistence,
  isHardHttpFailure,
  readHlsQualityPreference,
  resolveLevelIndexForStoredQuality,
} from '../playerPlaybackPreferences';
import type { PlayerProps } from '@/shared/types/PlayerTypes';

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

export interface UseArtplayerInstanceParams {
  streamUrl: string;
  subtitles: PlayerProps['subtitles'];
  thumbnail: PlayerProps['thumbnail'];
  intro: PlayerProps['intro'];
  outro: PlayerProps['outro'];
  episodeId: PlayerProps['episodeId'];
  episodes: PlayerProps['episodes'];
  currentEpisodeIndex: number;
  playNext: PlayerProps['playNext'];
  onEpisodeWatched: PlayerProps['onEpisodeWatched'];
  animeInfo: PlayerProps['animeInfo'];
  episodeNum: PlayerProps['episodeNum'];
  streamInfo: PlayerProps['streamInfo'];
  servers: PlayerProps['servers'];
  activeServerId: PlayerProps['activeServerId'];
  setActiveServerId: PlayerProps['setActiveServerId'];
  onPlaybackError: PlayerProps['onPlaybackError'];
}

/**
 * Ініціалізація Artplayer, Hls recovery, події закінчення епізоду та cleanup.
 * Рефи для episode/anime/playNext оновлюються щокадру — широкий список залежностей ефекту не потрібен.
 */
export function useArtplayerInstance({
  streamUrl,
  subtitles,
  thumbnail,
  intro,
  outro,
  episodeId,
  episodes,
  currentEpisodeIndex,
  playNext,
  onEpisodeWatched,
  animeInfo,
  episodeNum,
  streamInfo,
  servers,
  activeServerId,
  setActiveServerId,
  onPlaybackError,
}: UseArtplayerInstanceParams) {
  const artRef = useRef<HTMLDivElement>(null);
  const artInstanceRef = useRef<Artplayer | null>(null);
  const serversRef = useRef(servers);
  const activeServerIdRef = useRef(activeServerId);
  const episodeIdRef = useRef(episodeId);
  const episodesRef = useRef(episodes);
  const currentEpisodeIndexRef = useRef(currentEpisodeIndex);
  const playNextPropRef = useRef(playNext);
  const onEpisodeWatchedRef = useRef(onEpisodeWatched);
  const onPlaybackErrorRef = useRef(onPlaybackError);
  const animeInfoRef = useRef(animeInfo);
  const hasTriggeredNextRef = useRef(false);
  const hasMarkedWatchedForOutroRef = useRef(false);
  const userPausedRef = useRef(false);
  const upNextDismissedRef = useRef(false);

  const streamBootKey = useMemo(() => {
    const subKey = (subtitles ?? [])
      .map(
        (s) =>
          `${String(s.file ?? '').trim()}\t${String(s.label ?? '').trim()}`
      )
      .join('\n');
    const iKey = intro ? `${intro.start}:${intro.end}` : '·';
    const oKey = outro ? `${outro.start}:${outro.end}` : '·';
    return [streamUrl, thumbnail ?? '', iKey, oKey, subKey].join('\f');
  }, [streamUrl, thumbnail, intro, outro, subtitles]);

  useEffect(() => {
    serversRef.current = servers;
    activeServerIdRef.current = activeServerId;
    episodeIdRef.current = episodeId;
    episodesRef.current = episodes;
    currentEpisodeIndexRef.current = currentEpisodeIndex;
    playNextPropRef.current = playNext;
    onEpisodeWatchedRef.current = onEpisodeWatched;
    onPlaybackErrorRef.current = onPlaybackError;
    animeInfoRef.current = animeInfo;
  });

  useEffect(() => {
    hasTriggeredNextRef.current = false;
    hasMarkedWatchedForOutroRef.current = false;
    userPausedRef.current = false;
    upNextDismissedRef.current = false;
  }, [episodeId, episodes]);

  useEffect(() => {
    if (!streamUrl || !artRef.current) return;
    upNextDismissedRef.current = false;
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
        (episodeId: string) => {
          hasTriggeredNextRef.current = true;
          playNextPropRef.current(episodeId);
        },
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
        (_evt: unknown, data: {
          fatal?: boolean;
          type?: string;
          response?: { code?: number };
        }) => {
          if (
            data?.type === Hls.ErrorTypes.NETWORK_ERROR &&
            isHardHttpFailure(data)
          ) {
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
      if (
        (art as Artplayer & { __subtitleResizeRaf?: number }).__subtitleResizeRaf
      ) {
        cancelAnimationFrame(
          (art as Artplayer & { __subtitleResizeRaf?: number })
            .__subtitleResizeRaf as number
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

      if (hasTriggeredNextRef.current) return;

      const next = list?.[idx + 1];
      const info = animeInfoRef.current;

      if (upNextDismissedRef.current) {
        if (
          !next &&
          info?.id &&
          info.data_id != null &&
          list &&
          list.length > 0 &&
          idx >= 0
        ) {
          removeFromContinueWatching(info.id, info.data_id);
        }
        return;
      }

      if (next) {
        const nextId = getEpisodeNumberFromId(next.id);
        if (nextId) {
          hasTriggeredNextRef.current = true;
          playNextPropRef.current(nextId);
        }
        return;
      }
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
        playNextPropRef,
        episodeIdRef,
        thumbnail,
        episodesRef,
        currentEpisodeIndexRef,
        hasMarkedWatchedForOutroRef,
        hasTriggeredNextRef,
        upNextDismissedRef,
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
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updateContinueWatching(animeInfo, episodeId, episodeNum);
        });
      });

      const plugins = art.plugins as unknown as {
        artplayerPluginHlsControl?: { update?: () => void };
      };
      const syncHlsQualityUi = () => {
        plugins.artplayerPluginHlsControl?.update?.();
      };
      const hlsInstance = art.hls;
      const applyInitialHlsQuality = () => {
        if (!hlsInstance?.levels?.length) return;
        const stored = readHlsQualityPreference();
        /** Якщо в localStorage ще немає вибору — лишаємо ABR (-1). Примусовий старт з 1080p
         * після `startLevel: 0` у playM3u8 давав різке перемикання рівня й підлаги одразу після буферизації. */
        const idx = resolveLevelIndexForStoredQuality(
          hlsInstance.levels as Array<{ height?: number }>,
          stored
        );
        if (idx < 0) {
          hlsInstance.currentLevel = -1;
          hlsInstance.nextLevel = -1;
          hlsInstance.loadLevel = -1;
        } else {
          hlsInstance.currentLevel = idx;
          hlsInstance.nextLevel = idx;
          hlsInstance.loadLevel = idx;
        }
      };

      if (hlsInstance) {
        let detachQualityPersist: (() => void) | null = null;
        const onDestroyHlsUi = () => {
          hlsInstance.off(Hls.Events.MANIFEST_PARSED, applyInitialHlsQuality);
          hlsInstance.off(Hls.Events.LEVEL_SWITCHED, syncHlsQualityUi);
          hlsInstance.off(Hls.Events.MANIFEST_PARSED, syncHlsQualityUi);
          detachQualityPersist?.();
          detachQualityPersist = null;
        };

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, applyInitialHlsQuality);
        hlsInstance.on(Hls.Events.LEVEL_SWITCHED, syncHlsQualityUi);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, syncHlsQualityUi);
        applyInitialHlsQuality();
        syncHlsQualityUi();
        detachQualityPersist = attachHlsQualityPreferencePersistence(
          hlsInstance,
          syncHlsQualityUi
        );
        art.on('destroy', onDestroyHlsUi);
      }
    });

    artInstanceRef.current = art;

    return () => {
      const instanceToDestroy = artInstanceRef.current === art ? art : null;
      if (instanceToDestroy) {
        artInstanceRef.current = null;
        try {
          const resizeRaf = (
            instanceToDestroy as Artplayer & { __subtitleResizeRaf?: number }
          ).__subtitleResizeRaf;
          if (resizeRaf) {
            cancelAnimationFrame(resizeRaf);
            (
              instanceToDestroy as Artplayer & { __subtitleResizeRaf?: number }
            ).__subtitleResizeRaf = undefined;
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
        if (container && typeof container.innerHTML !== 'undefined')
          container.innerHTML = '';
      }
    };
  }, [streamBootKey]); // eslint-disable-line react-hooks/exhaustive-deps -- episode/anime/streamInfo через refs; fingerprint зменшує зайві ремоунти

  return { artRef };
}
