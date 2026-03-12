'use client';
import { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import artplayerPluginVttThumbnail from './artPlayerPluginVttThumbnail';
import {
  captionIcon,
  serverIcon,
} from './PlayerIcons';
import './Player.scss';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { PlayerProps } from '@/shared/types/PlayerTypes';
import {
  PROXY_URL,
  PLAYER_THEME_COLOR,
  LOGO_HIDE_DELAY_MS,
} from './playerConstants';
import { handlePlayerKeydown } from './playerKeydown';
import { getStreamFullUrl, getStreamHeaders, playM3u8 } from './playerStream';
import { useChapterStyles } from '@/hooks/useChapterStyles';
import { getArtplayerOptions } from './getArtplayerOptions';

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
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex(
      (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
    )
  );

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
  serversRef.current = servers;
  activeServerIdRef.current = activeServerId;
  episodeIdRef.current = episodeId;
  episodesRef.current = episodes;
  currentEpisodeIndexRef.current = currentEpisodeIndex;
  playNextRef.current = playNext;
  onEpisodeWatchedRef.current = onEpisodeWatched;

  useEffect(() => {
    hasTriggeredNextRef.current = false;
    hasMarkedWatchedForOutroRef.current = false;
    userPausedRef.current = false;
    if (episodes && episodes.length > 0) {
      const newIndex = episodes.findIndex(
        (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
      );
      setCurrentEpisodeIndex(newIndex);
    }
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
        const nextId = next.id.match(/ep=(\d+)/)?.[1];
        if (nextId) playNextRef.current?.(nextId);
      }
    });

    art.on('ready', () => {
      const goToNextEpisode = () => {
        const id = episodeIdRef.current;
        const list = episodesRef.current;
        const idx = currentEpisodeIndexRef.current ?? -1;
        const epId = id != null ? String(id) : '';
        if (epId) onEpisodeWatchedRef.current?.(epId);
        const next = list?.[idx + 1];
        if (next) {
          const nextId = next.id.match(/ep=(\d+)/)?.[1];
          if (nextId) playNextRef.current?.(nextId);
        }
      };
      if (art.video) {
        art.video.addEventListener('ended', goToNextEpisode);
        art.on('destroy', () =>
          art.video?.removeEventListener('ended', goToNextEpisode)
        );
      }

      const tryPlay = () => {
        if (userPausedRef.current) return;
        if (document.visibilityState === 'visible') art.play().catch(() => {});
      };
      if (document.visibilityState === 'visible') tryPlay();
      art.once('video:canplay', tryPlay);

      art.on('pause', () => {
        if (art.video) {
          art.video.pause();
          art.video.currentTime = art.currentTime;
        }
        if (art.hls) art.hls.stopLoad?.();
        if (artRef.current) {
          artRef.current.querySelectorAll('video, audio').forEach((el) => {
            (el as HTMLMediaElement).pause();
          });
        }
      });

      const skipIntroBtn = art.layers['skipIntro'];
      const skipOutroBtn = art.layers['skipOutro'];
      const logoLayer = art.layers.siteLogo;

      requestAnimationFrame(() => {
        logoLayer.style.opacity = '1';
        logoLayer.style.transform = 'translateY(0) scale(1)';
      });

      setTimeout(() => {
        logoLayer.style.opacity = '0';
        logoLayer.style.transform = 'translateY(-10px) scale(0.95)';
      }, LOGO_HIDE_DELAY_MS);

      art.on('video:timeupdate', () => {
        if (
          intro &&
          art.currentTime >= intro.start &&
          art.currentTime <= intro.end
        ) {
          skipIntroBtn.style.display = 'block';
        } else {
          skipIntroBtn.style.display = 'none';
        }
        if (
          outro &&
          outro.start != null &&
          outro.end != null &&
          art.currentTime >= outro.start &&
          art.currentTime <= outro.end
        ) {
          skipOutroBtn.style.display = 'block';
          if (!hasMarkedWatchedForOutroRef.current) {
            hasMarkedWatchedForOutroRef.current = true;
            const id = episodeIdRef.current;
            const epId = id != null ? String(id) : '';
            if (epId) onEpisodeWatchedRef.current?.(epId);
          }
        } else {
          skipOutroBtn.style.display = 'none';
        }
        const duration = art.video?.duration ?? art.duration;
        const list = episodesRef.current;
        const idx = currentEpisodeIndexRef.current ?? -1;
        const hasNextEpisode = list != null && list[idx + 1] != null;
        if (
          hasNextEpisode &&
          Number.isFinite(duration) &&
          duration > 0 &&
          art.currentTime >= Math.max(0, duration - 2) &&
          !hasTriggeredNextRef.current
        ) {
          hasTriggeredNextRef.current = true;
          goToNextEpisode();
        }
      });

      document.addEventListener('keydown', (event) =>
        handlePlayerKeydown(event, art)
      );
      art.subtitle.style({
        fontSize:
          (art.width > 500 ? art.width * 0.02 : art.width * 0.03) + 'px',
      });
      thumbnail &&
        art.plugins.add(
          artplayerPluginVttThumbnail({
            vtt: `${PROXY_URL}${thumbnail}`,
          })
        );
      const defaultEnglishSub =
        subtitles?.find(
          (sub) => sub.label.toLowerCase() === 'english' && sub.default
        ) || subtitles?.find((sub) => sub.label.toLowerCase() === 'english');
      subtitles &&
        subtitles.length > 0 &&
        art.setting.add({
          name: 'captions',
          icon: captionIcon,
          html: 'Subtitle',
          tooltip:
            subtitles.find((sub) => sub.label.toLowerCase() === 'english')
              ?.label || 'default',
          position: 'right',
          selector: [
            {
              html: 'Display',
              switch: true,
              onSwitch: function (item) {
                item.tooltip = item.switch ? 'Hide' : 'Show';
                art.subtitle.show = !item.switch;
                return !item.switch;
              },
            },
            ...subtitles.map((sub) => ({
              default:
                sub.label.toLowerCase() === 'english' &&
                sub === defaultEnglishSub,
              html: sub.label,
              url: sub.file,
            })),
          ],
          onSelect: function (item) {
            art.subtitle.switch(item.url, { name: item.html });
            return item.html;
          },
        });
      const defaultSubtitle = subtitles?.find(
        (sub) => sub.label.toLowerCase() === 'english'
      );
      if (defaultSubtitle) {
        art.subtitle.switch(defaultSubtitle.file, {
          name: defaultSubtitle.label,
          default: true,
        } as { name: string; default?: boolean });
      }

      const langServers = serversRef.current ?? null;
      const langActiveId = activeServerIdRef.current ?? null;
      const getPreferredServer = (list: ServerInfo[] | null | undefined) =>
        list?.find((s: ServerInfo) => s.serverName === 'HD-2') ||
        list?.find((s: ServerInfo) => s.serverName === 'HD-1') ||
        list?.[0];
      const subList = langServers?.filter((s) => s.type === 'sub') ?? [];
      const dubList = langServers?.filter((s) => s.type === 'dub') ?? [];
      const jp = getPreferredServer(subList);
      const en = getPreferredServer(dubList);
      type LangOption = {
        html: string;
        default: boolean;
        data_id: number;
        serverName: string;
        type: string;
      };
      const languageSelectorRaw: LangOption[] = [
        jp && {
          html: 'Japanese',
          default: String(jp.data_id) === String(langActiveId),
          data_id: jp.data_id,
          serverName: jp.serverName,
          type: jp.type,
        },
        en && {
          html: 'English',
          default: String(en.data_id) === String(langActiveId),
          data_id: en.data_id,
          serverName: en.serverName,
          type: en.type,
        },
      ].filter((x): x is LangOption => Boolean(x));
      const languageSelector =
        languageSelectorRaw.length <= 1
          ? languageSelectorRaw
          : [...languageSelectorRaw].sort((a, b) =>
              String(a.data_id) === String(langActiveId)
                ? -1
                : String(b.data_id) === String(langActiveId)
                  ? 1
                  : 0
            );
      if (languageSelector.length > 0) {
        const currentLang = langServers?.find(
          (s) => String(s.data_id) === String(langActiveId)
        );
        art.setting.add({
          name: 'language',
          icon: serverIcon,
          html: 'Language',
          tooltip: currentLang
            ? currentLang.type === 'sub'
              ? 'Japanese'
              : 'English'
            : 'Language',
          position: 'right',
          selector: languageSelector.map((item) => ({
            html: item.html,
            default: String(item.data_id) === String(langActiveId),
            data_id: item.data_id,
            serverName: item.serverName,
            type: item.type,
          })),
          onSelect: function (item: Record<string, unknown>) {
            const dataId = item.data_id != null ? String(item.data_id) : null;
            if (dataId) setActiveServerId(dataId);
            if (typeof item.serverName === 'string')
              localStorage.setItem('server_name', item.serverName);
            if (typeof item.type === 'string')
              localStorage.setItem('server_type', item.type);
            return typeof item.html === 'string' ? item.html : '';
          },
        });
      }

      const $rewind = art.layers['rewind'] as HTMLDivElement | undefined;
      const $forward = art.layers['forward'] as HTMLDivElement | undefined;
      Artplayer.utils.isMobile &&
        $rewind &&
        art.proxy($rewind, 'dblclick', () => {
          art.currentTime = Math.max(0, art.currentTime - 10);
          art.layers['backwardIcon'].style.opacity = '1';
          setTimeout(() => {
            art.layers['backwardIcon'].style.opacity = '0';
          }, 300);
        });
      Artplayer.utils.isMobile &&
        $forward &&
        art.proxy($forward, 'dblclick', () => {
          art.currentTime = Math.max(0, art.currentTime + 10);
          art.layers['forwardIcon'].style.opacity = '1';
          setTimeout(() => {
            art.layers['forwardIcon'].style.opacity = '0';
          }, 300);
        });
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
      const continueWatching = (JSON.parse(
        localStorage.getItem('continueWatching') || '[]'
      ) || []) as Array<{ data_id?: number }>;

      const newEntry = {
        id: animeInfo?.id,
        data_id: animeInfo?.data_id,
        episodeId,
        episodeNum,
        adultContent: animeInfo?.adultContent,
        poster: animeInfo?.poster,
        title: animeInfo?.title,
        japanese_title: animeInfo?.japanese_title,
      };

      if (!newEntry.data_id) return;

      const existingIndex = continueWatching.findIndex(
        (item: { data_id?: number }) => item.data_id === newEntry.data_id
      );

      if (existingIndex !== -1) {
        continueWatching[existingIndex] = newEntry;
      } else {
        continueWatching.push(newEntry);
      }
      localStorage.setItem(
        'continueWatching',
        JSON.stringify(continueWatching)
      );
    };
  }, [streamUrl, subtitles, intro, outro]);

  return <div ref={artRef} className="relative h-full w-full"></div>;
}
