import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import { artplayerPluginChapter } from './artPlayerPluinChaper';
import artplayerPluginVttThumbnail from './artPlayerPluginVttThumbnail';
import {
  backwardIcon,
  captionIcon,
  forwardIcon,
  forward10Icon,
  fullScreenOffIcon,
  fullScreenOnIcon,
  loadingIcon,
  muteIcon,
  pauseIcon,
  pipIcon,
  playIcon,
  playIconLg,
  serverIcon,
  settingsIcon,
  volumeIcon,
} from './PlayerIcons';
import './Player.scss';
import { getChapterStyles } from './getChapterStyle';
import artplayerPluginHlsControl from 'artplayer-plugin-hls-control';
import { artplayerPluginUploadSubtitle } from './artplayerPluginUploadSubtitle';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { PlayerProps } from '@/shared/types/PlayerTypes';
import {
  M3U8_PROXY_URL,
  PROXY_URL,
  DEFAULT_REFERER,
  PLAYER_THEME_COLOR,
  SUBTITLE_DEFAULT_STYLE,
  LOGO_HIDE_DELAY_MS,
} from './playerConstants';
import { createChapters } from './playerChapters';
import { handlePlayerKeydown } from './playerKeydown';
import { useChapterStyles } from '@/hooks/useChapterStyles';

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

  const playM3u8 = (
    video: HTMLVideoElement,
    url: string,
    art: Artplayer
  ): void => {
    if (Hls.isSupported()) {
      if (art.hls) art.hls.destroy();
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      art.hls = hls;
      art.on('destroy', () => hls.destroy());
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (
      typeof process !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      console.warn('Unsupported playback format: m3u8');
    }
  };

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
    const streamLinkRaw = streamInfo?.streamingLink as
      | { iframe?: string }
      | undefined;
    const iframeUrl =
      streamLinkRaw && !Array.isArray(streamLinkRaw)
        ? streamLinkRaw.iframe
        : undefined;
    const headers: Record<string, string> = {};
    if (iframeUrl) {
      try {
        const url = new URL(iframeUrl);
        headers.Referer = url.origin + '/';
      } catch {
        headers.Referer = DEFAULT_REFERER;
      }
    } else {
      headers.Referer = DEFAULT_REFERER;
    }

    const fullURL =
      M3U8_PROXY_URL +
      encodeURIComponent(streamUrl) +
      '&headers=' +
      encodeURIComponent(JSON.stringify(headers));

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
      plugins: [
        artplayerPluginHlsControl({
          quality: {
            setting: true,
            getName: (level: { height?: number }) =>
              String(level?.height ?? '') + 'P',
            title: 'Quality',
            auto: 'Auto',
          },
        }),
        artplayerPluginUploadSubtitle(),
        artplayerPluginChapter({
          chapters: createChapters(intro, outro),
        }),
      ],
      subtitle: {
        style: SUBTITLE_DEFAULT_STYLE,
        escape: false,
      },
      layers: [
        {
          name: 'siteLogo',
          html: `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:flex-end;
      gap:4px;
      padding:10px 16px;
      border-radius:14px;
      background:linear-gradient(135deg, rgba(20,20,20,0.75), rgba(40,40,40,0.55));
      backdrop-filter:blur(10px);
      border:1px solid rgba(255,255,255,0.08);
      box-shadow:
        0 8px 30px rgba(0,0,0,0.45),
        inset 0 0 15px rgba(255,255,255,0.03);
    ">
      
      <div style="
        font-size:20px;
        font-weight:800;
        letter-spacing:0.5px;
        font-family:system-ui, -apple-system, sans-serif;
      ">
        <span style="
          background:linear-gradient(90deg,#ff7a18,#ffb347);
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
        ">Otaku</span>
        <span style="color:#ffffff;">Fusion</span>
      </div>

      <div style="
        font-size:12px;
        font-weight:500;
        color:rgba(255,255,255,0.75);
        letter-spacing:0.4px;
      ">
        ✨ Enjoy watching with Us
      </div>

    </div>
  `,
          style: {
            position: 'absolute',
            top: '18px',
            right: '20px',
            opacity: '1',
            transform: 'translateY(-10px) scale(0.95)',
            transition: 'all 0.6s cubic-bezier(.22,.61,.36,1)',
            pointerEvents: 'none',
          },
        },
        {
          html: '',
          style: {
            position: 'absolute',
            left: '50%',
            top: '0',
            width: '20%',
            height: '100%',
            transform: 'translateX(-50%)',
          },
          disable: !Artplayer.utils.isMobile,
          click: function () {
            if (art.playing) {
              userPausedRef.current = true;
              art.pause();
            } else {
              userPausedRef.current = false;
              art.play();
            }
          },
        },
        {
          name: 'videoToggle',
          html: '',
          style: {
            position: 'absolute',
            inset: '0',
            zIndex: '100',
            cursor: 'pointer',
          },
          disable: Artplayer.utils.isMobile,
          click: () => {
            if (art.playing) {
              userPausedRef.current = true;
              art.pause();
            } else {
              userPausedRef.current = false;
              art.play();
            }
          },
        },
        {
          name: 'rewind',
          html: '',
          style: {
            position: 'absolute',
            left: '0',
            top: '0',
            width: '40%',
            height: '100%',
          },
          disable: !Artplayer.utils.isMobile,
          click: () => {
            art.controls.show = !art.controls.show;
          },
        },
        {
          name: 'forward',
          html: '',
          style: {
            position: 'absolute',
            right: '0',
            top: '0',
            width: '40%',
            height: '100%',
          },
          disable: !Artplayer.utils.isMobile,
          click: () => {
            art.controls.show = !art.controls.show;
          },
        },
        {
          name: 'backwardIcon',
          html: backwardIcon,
          style: {
            position: 'absolute',
            left: '25%',
            top: '50%',
            transform: 'translate(50%,-50%)',
            opacity: '0',
            transition: 'opacity 0.5s ease-in-out',
          },
          disable: !Artplayer.utils.isMobile,
        },
        {
          name: 'forwardIcon',
          html: forwardIcon,
          style: {
            position: 'absolute',
            right: '25%',
            top: '50%',
            transform: 'translate(50%, -50%)',
            opacity: '0',
            transition: 'opacity 0.5s ease-in-out',
          },
          disable: !Artplayer.utils.isMobile,
        },
        {
          name: 'skipIntro',
          html: '<div class="skip-intro-btn">Skip Intro</div>',
          style: {
            position: 'absolute',
            bottom: '90px',
            right: '30px',
            padding: '10px 18px',
            background: 'rgba(40, 40, 40, 0.55)',
            backdropFilter: 'blur(6px)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'none',
            zIndex: '9999',
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          click: () => {
            if (intro) art.currentTime = intro.end;
          },
        },
        {
          name: 'skipOutro',
          html: '<div class="skip-outro-btn">Next Episode</div>',
          style: {
            position: 'absolute',
            bottom: '90px',
            right: '30px',
            padding: '10px 18px',
            background: 'rgba(40, 40, 40, 0.55)',
            backdropFilter: 'blur(6px)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'none',
            zIndex: '9999',
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          click: () => {
            const idx = currentEpisodeIndex ?? -1;
            const next = episodes?.[idx + 1];
            if (next) {
              const nextId = next.id.match(/ep=(\d+)/)?.[1];
              if (nextId) playNext(nextId);
            } else if (outro) {
              art.currentTime = outro.end;
            }
          },
        },
      ],
      icons: {
        play: playIcon,
        pause: pauseIcon,
        setting: settingsIcon,
        volume: volumeIcon,
        pip: pipIcon,
        volumeClose: muteIcon,
        state: playIconLg,
        loading: loadingIcon,
        fullscreenOn: fullScreenOnIcon,
        fullscreenOff: fullScreenOffIcon,
      },
      customType: {
        m3u8: playM3u8,
      },
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

      const ranges = [
        ...(intro && intro.start != null && intro.end != null
          ? [[intro.start + 1, intro.end - 1]]
          : []),
        ...(outro && outro.start != null && outro.end != null
          ? [[outro.start + 1, outro.end]]
          : []),
      ];
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
