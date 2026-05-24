'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

import { PLAYER_THEME_COLOR } from '../playerConstants';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { getStreamFullUrl, getStreamHeaders, playM3u8 } from '../playerStream';
import { urlLooksLikeHlsStream } from '@/lib/streamMediaType';
import { getArtplayerOptions } from '../getArtplayerOptions';
import { setupPlayerReady } from '../setupPlayerReady';
import { syncPlayerLanguageMenu } from '../syncPlayerLanguageMenu';
import { attachStreamQualityMenu } from '../attachStreamQualityMenu';
import {
  clampChaptersToDuration,
  skipSegmentsToChapterItems,
} from '../skipSegmentsPlayerUtils';
import type { ChapterItem } from '../artPlayerPluginChapter';
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
import { inferStreamMediaKind } from '@/lib/streamMediaType';

function inferArtplayerMediaType(
  streamUrl: string,
  streamInfo: PlayerProps['streamInfo'],
  proxiedUrl: string
): 'm3u8' | 'mp4' {
  if (urlLooksLikeHlsStream(streamUrl) || urlLooksLikeHlsStream(proxiedUrl)) {
    return 'm3u8';
  }
  const linkRaw = streamInfo?.streamingLink;
  const first = Array.isArray(linkRaw) ? linkRaw[0] : linkRaw;
  const mediaType =
    first && typeof first === 'object' && first.link?.type
      ? String(first.link.type).toLowerCase()
      : '';
  if (mediaType === 'mp4') return 'mp4';
  if (mediaType === 'hls' || mediaType === 'm3u8') return 'm3u8';
  return inferStreamMediaKind(streamUrl) === 'mp4' ? 'mp4' : 'm3u8';
}

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

/** Після зриву HLS `art.duration` скидається, а текст у `.art-progress-tip` може лишатися — прибираємо «спалах» тривалості. */
function resetArtplayerProgressHoverUi(art: Artplayer) {
  try {
    const $player = art.template?.$player;
    if (!$player) return;
    $player.classList.remove('art-progress-hover');
    const tip = $player.querySelector('.art-progress-tip');
    if (tip) tip.textContent = '00:00';
  } catch {
    /* noop */
  }
}

/** У dev за замовчуванням відкладаємо створення Hls на наступний macrotask — обхід подвійного mount Strict Mode. */
function readPlayerDeferStrictInit(): boolean {
  if (typeof process === 'undefined' || process.env.NODE_ENV !== 'development') {
    return false;
  }
  const raw = process.env.NEXT_PUBLIC_PLAYER_DEFER_STRICT_INIT?.trim().toLowerCase();
  if (raw === '0' || raw === 'false') return false;
  return true;
}

export interface UseArtplayerInstanceParams {
  streamUrl: string;
  subtitles: PlayerProps['subtitles'];
  thumbnail: PlayerProps['thumbnail'];
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
  watchStreamProvider: PlayerProps['watchStreamProvider'];
  setWatchStreamProvider: PlayerProps['setWatchStreamProvider'];
  onPlaybackError: PlayerProps['onPlaybackError'];
  onPlaybackSurfaceReady: PlayerProps['onPlaybackSurfaceReady'];
  anilibertyLanguageMenuEligible: PlayerProps['anilibertyLanguageMenuEligible'];
  hikkaLanguageMenuEligible: PlayerProps['hikkaLanguageMenuEligible'];
}

/**
 * Ініціалізація Artplayer, Hls recovery, події закінчення епізоду та cleanup.
 * Рефи для episode/anime/playNext оновлюються щокадру — широкий список залежностей ефекту не потрібен.
 */
export function useArtplayerInstance({
  streamUrl,
  subtitles,
  thumbnail,
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
  watchStreamProvider,
  setWatchStreamProvider,
  onPlaybackError,
  onPlaybackSurfaceReady,
  anilibertyLanguageMenuEligible,
  hikkaLanguageMenuEligible,
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
  const onPlaybackSurfaceReadyRef = useRef(onPlaybackSurfaceReady);
  const animeInfoRef = useRef(animeInfo);
  const hasTriggeredNextRef = useRef(false);
  const userPausedRef = useRef(false);

  const streamBootKey = useMemo(() => {
    const subKey = (subtitles ?? [])
      .map(
        (s) =>
          `${String(s.file ?? '').trim()}\t${String(s.label ?? '').trim()}`
      )
      .join('\n');
    const seg = streamInfo?.skipSegments;
    const qv = streamInfo?.qualityVariants;
    const qvKey = qv?.length
      ? qv.map((q) => `${q.height}:${q.url}`).join('|')
      : '';
    const segKey = seg
      ? [
          seg.intro ? `${seg.intro.start}-${seg.intro.end}` : '',
          seg.outro ? `${seg.outro.start}-${seg.outro.end}` : '',
        ].join('|')
      : '';
    return [watchStreamProvider, streamUrl, thumbnail ?? '', subKey, segKey, qvKey].join('\f');
  }, [
    watchStreamProvider,
    streamUrl,
    thumbnail,
    subtitles,
    streamInfo?.skipSegments,
    streamInfo?.qualityVariants,
  ]);

  const watchStreamProviderRef = useRef(watchStreamProvider);
  const setWatchStreamProviderRef = useRef(setWatchStreamProvider);
  const setActiveServerIdRef = useRef(setActiveServerId);
  const anilibertyEligibleRef = useRef(anilibertyLanguageMenuEligible ?? false);
  const hikkaEligibleRef = useRef(hikkaLanguageMenuEligible ?? false);

  useEffect(() => {
    watchStreamProviderRef.current = watchStreamProvider;
    setWatchStreamProviderRef.current = setWatchStreamProvider;
    setActiveServerIdRef.current = setActiveServerId;
    anilibertyEligibleRef.current = anilibertyLanguageMenuEligible ?? false;
    hikkaEligibleRef.current = hikkaLanguageMenuEligible ?? false;
  });

  const syncLanguageMenuIfReady = useCallback(() => {
    const art = artInstanceRef.current;
    if (!art) return;
    syncPlayerLanguageMenu(art, {
      serversRef,
      activeServerIdRef,
      watchStreamProvider: watchStreamProviderRef.current,
      setWatchStreamProvider: (next) => setWatchStreamProviderRef.current(next),
      setActiveServerId: (id) => setActiveServerIdRef.current(id),
      anilibertyLanguageMenuEligible: anilibertyEligibleRef.current,
      hikkaLanguageMenuEligible: hikkaEligibleRef.current,
    });
  }, []);

  useEffect(() => {
    syncLanguageMenuIfReady();
  }, [
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    watchStreamProvider,
    activeServerId,
    servers,
    syncLanguageMenuIfReady,
  ]);

  useEffect(() => {
    serversRef.current = servers;
    activeServerIdRef.current = activeServerId;
    episodeIdRef.current = episodeId;
    episodesRef.current = episodes;
    currentEpisodeIndexRef.current = currentEpisodeIndex;
    playNextPropRef.current = playNext;
    onEpisodeWatchedRef.current = onEpisodeWatched;
    onPlaybackErrorRef.current = onPlaybackError;
    onPlaybackSurfaceReadyRef.current = onPlaybackSurfaceReady;
    animeInfoRef.current = animeInfo;
  });

  useEffect(() => {
    hasTriggeredNextRef.current = false;
    userPausedRef.current = false;
  }, [episodeId, episodes]);

  useEffect(() => {
    if (!streamUrl || !artRef.current) return;
    /**
     * Strict Mode (dev): перший pass ефекту знімається до того, як спрацює відкладений init —
     * без цього Hls встигає підписатися до MSE й дає bufferAddCodec / bufferAppend на «фейковому» unmount.
     * Вимкнути: NEXT_PUBLIC_PLAYER_DEFER_STRICT_INIT=0
     */
    let effectActive = true;
    let initTimer: number | null = null;
    let surfaceReadyTimer: number | null = null;
    let suppressPlaybackError = false;
    let createdPlayer: Artplayer | undefined;

    const deferStrictInit = readPlayerDeferStrictInit();

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

    const runPlayerInit = (): void => {
      if (!effectActive || !artRef.current) return;

      const headers = getStreamHeaders(streamInfo, streamUrl);
      const fullURL = getStreamFullUrl(streamUrl, headers);
      const looksHls =
        urlLooksLikeHlsStream(streamUrl) || urlLooksLikeHlsStream(fullURL);
      const playerMediaType = inferArtplayerMediaType(streamUrl, streamInfo, fullURL);
      const useHlsPlayback = looksHls;
      const useManualStreamQuality = Boolean(
        streamInfo?.qualityVariants && streamInfo.qualityVariants.length > 1
      );

      /** Під час destroy/remount Hls/video часто шлють шумні події — не показувати «unavailable». */
      suppressPlaybackError = false;

      let hasReportedError = false;
      let hlsRecoverNetworkTried = false;
      /** 0 = ще не пробували; 1 = recoverMediaError; 2 = swapAudioCodec + recoverMediaError */
      let hlsMediaRecoveryStep = 0;
      let art: Artplayer;
      const reportError = () => {
        if (!effectActive || suppressPlaybackError || hasReportedError) return;
        hasReportedError = true;
        resetArtplayerProgressHoverUi(art);
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

      const onM3u8HlsInstance = (hls: InstanceType<typeof Hls>, _art: Artplayer) => {
          hls.on(
            Hls.Events.ERROR,
            (_evt: unknown, data: {
              fatal?: boolean;
              type?: string;
              response?: { code?: number };
            }) => {
              if (!effectActive) return;
              if (
                typeof process !== 'undefined' &&
                process.env.NODE_ENV === 'development'
              ) {
                const d = data as {
                  details?: unknown;
                  reason?: unknown;
                  fatal?: unknown;
                };
                const http = (data as { response?: { code?: number } }).response?.code;
                const payload: Record<string, unknown> = {
                  type: data?.type,
                  fatal: data?.fatal,
                  details: d.details,
                };
                if (http != null) payload.http = http;
                if (d.reason != null && d.reason !== '') payload.reason = d.reason;
                /** Відомі MSE-шумові події (owocdn / fMP4) — debug, щоб не засмічувати консоль; мережа — warn. */
                const detailsStr = String(d.details ?? '');
                const isNoisyMseDetails =
                  detailsStr === 'bufferAddCodecError' ||
                  detailsStr === 'bufferAppendError';
                const log =
                  data?.type === Hls.ErrorTypes.MEDIA_ERROR && isNoisyMseDetails
                    ? console.debug
                    : console.warn;
                log('[OtakuFusion][Hls]', payload);
              }
              if (
                data?.type === Hls.ErrorTypes.NETWORK_ERROR &&
                isHardHttpFailure(data)
              ) {
                reportError();
                return;
              }
              if (data?.fatal && hls) {
                if (
                  data.type === Hls.ErrorTypes.NETWORK_ERROR &&
                  !hlsRecoverNetworkTried
                ) {
                  hlsRecoverNetworkTried = true;
                  try {
                    hls.startLoad();
                    return;
                  } catch {
                    /* fall through to reportError */
                  }
                }
                if (data.type === Hls.ErrorTypes.MEDIA_ERROR && hlsMediaRecoveryStep < 2) {
                  hlsMediaRecoveryStep += 1;
                  try {
                    if (hlsMediaRecoveryStep === 1) {
                      hls.recoverMediaError();
                    } else {
                      hls.swapAudioCodec();
                      hls.recoverMediaError();
                    }
                    return;
                  } catch {
                    /* fall through */
                  }
                }
                reportError();
                return;
              }
            }
          );
      };

      const onM3u8HlsBeforeLoad = (hls: InstanceType<typeof Hls>) => {
        const storedQualitySnapshot = readHlsQualityPreference();
        const applyInitialLevelOnce = () => {
          hls.off(Hls.Events.MANIFEST_PARSED, applyInitialLevelOnce);
          try {
            if (!hls.levels?.length) {
              hls.loadLevel = -1;
              return;
            }
            const idx = resolveLevelIndexForStoredQuality(
              hls.levels as Array<{ height?: number; bitrate?: number }>,
              storedQualitySnapshot
            );
            if (idx < 0) {
              hls.currentLevel = 0;
              hls.nextLevel = 0;
              hls.loadLevel = 0;
            } else {
              hls.currentLevel = idx;
              hls.nextLevel = idx;
              hls.loadLevel = idx;
            }
          } finally {
            try {
              hls.startLoad();
            } catch {
              /* noop */
            }
          }
        };
        hls.on(Hls.Events.MANIFEST_PARSED, applyInitialLevelOnce);
      };

    art = new Artplayer({
      container,
      url: fullURL,
      type: playerMediaType,
      autoplay: false,
      volume: 1,
      setting: true,
      playbackRate: true,
      pip: true,
      hotkey: false,
      fullscreen: true,
      mutex: true,
      playsInline: true,
      /** false: `lock` на мобільних/емуляції інколи заважає старту відтворення (Chrome + HLS). */
      lock: false,
      airplay: true,
      autoOrientation: true,
      fastForward: true,
      aspectRatio: true,
      subtitleOffset: true,
      theme: PLAYER_THEME_COLOR,
      ...getArtplayerOptions(
        userPausedRef,
        onM3u8HlsInstance,
        onM3u8HlsBeforeLoad,
        useManualStreamQuality
      ),
    });

    const bootHlsPlayback = () => {
      if (!effectActive) return;
      if (!Hls.isSupported()) {
        reportError();
        return;
      }
      try {
        if (art.video) {
          art.video.removeAttribute('src');
          art.video.load();
        }
      } catch {
        /* noop */
      }
      playM3u8(art.video, fullURL, art, {
        onHlsBeforeLoad: onM3u8HlsBeforeLoad,
        onHlsInstance: (hls) => onM3u8HlsInstance(hls, art),
      });
    };

    if (useHlsPlayback) {
      bootHlsPlayback();
    }

    art.on('video:error', () => {
      if (!effectActive || suppressPlaybackError) return;
      const code = art.video?.error?.code;
      if (code === MediaError.MEDIA_ERR_ABORTED) return;
      reportError();
    });

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
      const rawLang = streamInfo?.streamingLink?.[0]?.type;
      const streamLang =
        rawLang === 'dub' || rawLang === 'sub' ? rawLang : null;
      setupPlayerReady(
        art,
        thumbnail,
        setActiveServerId,
        userPausedRef,
        artRef,
        subtitles,
        streamLang,
        serversRef,
        activeServerIdRef,
        watchStreamProvider,
        setWatchStreamProvider,
        anilibertyEligibleRef.current,
        hikkaEligibleRef.current,
        streamInfo?.skipSegments
      );
      syncLanguageMenuIfReady();
      queueMicrotask(syncLanguageMenuIfReady);
      attachStreamQualityMenu(art, streamInfo ?? null, streamUrl);
      queueMicrotask(() => {
        updateContinueWatching(animeInfo, episodeId, episodeNum);
      });

      type ChapterPlugin = {
        update?: (o: { chapters?: ChapterItem[] }) => void;
      };
      const chapterPlugin = (art.plugins as { artplayerPluginChapter?: ChapterPlugin })
        .artplayerPluginChapter;
      const rawChapters = skipSegmentsToChapterItems(streamInfo?.skipSegments);
      const applyChapterMarkers = () => {
        if (!rawChapters.length) return;
        const dur = art.video?.duration ?? art.duration;
        if (!Number.isFinite(dur) || dur <= 0) return;
        const clamped = clampChaptersToDuration(rawChapters, dur);
        if (!clamped.length) return;
        try {
          chapterPlugin?.update?.({ chapters: clamped });
        } catch {
          /* різна тривалість релізу / некоректні мітки */
        }
      };
      art.once('video:loadedmetadata', applyChapterMarkers);
      applyChapterMarkers();

      /** UI якості: початковий рівень уже виставлено в `MANIFEST_PARSED` (onM3u8HlsBeforeLoad). */
      const storedQualitySnapshot = readHlsQualityPreference();

      const plugins = art.plugins as unknown as {
        artplayerPluginHlsControl?: { update?: () => void };
      };
      const syncHlsQualityUi = () => {
        plugins.artplayerPluginHlsControl?.update?.();
      };
      const hlsInstance = art.hls;

      if (hlsInstance && !useManualStreamQuality) {
        let detachQualityPersist: (() => void) | null = null;
        const onDestroyHlsUi = () => {
          hlsInstance.off(Hls.Events.MANIFEST_PARSED, syncHlsQualityUi);
          hlsInstance.off(Hls.Events.LEVEL_SWITCHED, syncHlsQualityUi);
          detachQualityPersist?.();
          detachQualityPersist = null;
        };

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, syncHlsQualityUi);
        hlsInstance.on(Hls.Events.LEVEL_SWITCHED, syncHlsQualityUi);
        syncHlsQualityUi();
        detachQualityPersist = attachHlsQualityPreferencePersistence(
          hlsInstance,
          syncHlsQualityUi,
          {
            muteInitialPersistenceMs:
              storedQualitySnapshot === null ||
              storedQualitySnapshot === 'best-display' ||
              storedQualitySnapshot === 'auto'
                ? 2200
                : 0,
          }
        );
        art.on('destroy', onDestroyHlsUi);
      }

      let surfaceReported = false;
      const reportSurfaceOnce = () => {
        if (surfaceReported) return;
        surfaceReported = true;
        if (surfaceReadyTimer != null) {
          window.clearTimeout(surfaceReadyTimer);
          surfaceReadyTimer = null;
        }
        queueMicrotask(() => {
          onPlaybackSurfaceReadyRef.current?.();
        });
      };
      art.once('video:playing', reportSurfaceOnce);
      art.once('video:canplaythrough', reportSurfaceOnce);
      art.once('video:loadedmetadata', reportSurfaceOnce);
      surfaceReadyTimer = window.setTimeout(reportSurfaceOnce, 7200);
    });

      artInstanceRef.current = art;
      createdPlayer = art;
      queueMicrotask(syncLanguageMenuIfReady);
    };

    if (deferStrictInit) {
      initTimer = window.setTimeout(() => {
        initTimer = null;
        runPlayerInit();
      }, 0);
    } else {
      runPlayerInit();
    }

    return () => {
      effectActive = false;
      suppressPlaybackError = true;
      if (initTimer != null) {
        window.clearTimeout(initTimer);
        initTimer = null;
      }
      if (surfaceReadyTimer != null) {
        window.clearTimeout(surfaceReadyTimer);
        surfaceReadyTimer = null;
      }
      const instanceToDestroy =
        createdPlayer && artInstanceRef.current === createdPlayer
          ? createdPlayer
          : null;
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
