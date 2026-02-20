// @ts-nocheck
/* eslint-disable react/prop-types */
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import artplayerPluginChapter from './artPlayerPluinChaper';
import autoSkip from './autoSkip';
import artplayerPluginVttThumbnail from './artPlayerPluginVttThumbnail';
import {
  backward10Icon,
  backwardIcon,
  captionIcon,
  forward10Icon,
  forwardIcon,
  fullScreenOffIcon,
  fullScreenOnIcon,
  loadingIcon,
  logo,
  muteIcon,
  pauseIcon,
  pipIcon,
  playIcon,
  playIconLg,
  settingsIcon,
  volumeIcon,
} from './PlayerIcons';
import './Player.scss';
import website_name from '@/config/website';
import getChapterStyles from './getChapterStyle';
import artplayerPluginHlsControl from 'artplayer-plugin-hls-control';
import artplayerPluginUploadSubtitle from './artplayerPluginUploadSubtitle';

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

const KEY_CODES = {
  M: 'm',
  I: 'i',
  F: 'f',
  V: 'v',
  SPACE: ' ',
  ARROW_UP: 'arrowup',
  ARROW_DOWN: 'arrowdown',
  ARROW_RIGHT: 'arrowright',
  ARROW_LEFT: 'arrowleft',
};

export default function Player({
  streamUrl,
  subtitles,
  thumbnail,
  intro,
  outro,
  // autoSkipIntro,
  // autoPlay,
  // autoNext,
  episodeId,
  episodes,
  playNext,
  animeInfo,
  episodeNum,
  streamInfo,
}) {
  const artRef = useRef(null);
  const proxy = 'https://cors-anywhere-9ycb.onrender.com/?url=';
  const m3u8proxy = 'https://m3u8proxy.fly.dev/m3u8-proxy?url=' || [];

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex(
      (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
    )
  );

  useEffect(() => {
    if (episodes?.length > 0) {
      const newIndex = episodes.findIndex(
        (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
      );
      setCurrentEpisodeIndex(newIndex);
    }
  }, [episodeId, episodes]);

  useEffect(() => {
    const applyChapterStyles = () => {
      const existingStyles = document.querySelectorAll(
        'style[data-chapter-styles]'
      );
      existingStyles.forEach((style) => style.remove());
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-chapter-styles', 'true');
      const styles = getChapterStyles(intro, outro);
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
      return () => {
        styleElement.remove();
      };
    };

    if (streamUrl || intro || outro) {
      const cleanup = applyChapterStyles();
      return cleanup;
    }
  }, [streamUrl, intro, outro]);

  const playM3u8 = (video, url, art) => {
    if (Hls.isSupported()) {
      if (art.hls) art.hls.destroy();
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      art.hls = hls;

      art.on('destroy', () => hls.destroy());

      // hls.on(Hls.Events.ERROR, (event, data) => {
      //   console.error("HLS.js error:", data);
      // });
      video.addEventListener('timeupdate', () => {
        const currentTime = Math.round(video.currentTime);
        const duration = Math.round(video.duration);
        if (duration > 0) {
          if (currentTime >= duration) {
            art.pause();
            if (currentEpisodeIndex < episodes?.length - 1 && autoNext) {
              playNext(
                episodes[currentEpisodeIndex + 1].id.match(/ep=(\d+)/)?.[1]
              );
            }
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('timeupdate', () => {
        const currentTime = Math.round(video.currentTime);
        const duration = Math.round(video.duration);
        if (duration > 0) {
          if (currentTime >= duration) {
            art.pause();
            if (currentEpisodeIndex < episodes?.length - 1 && autoNext) {
              playNext(
                episodes[currentEpisodeIndex + 1].id.match(/ep=(\d+)/)?.[1]
              );
            }
          }
        }
      });
    } else {
      console.log('Unsupported playback format: m3u8');
    }
  };

  const createChapters = () => {
    const chapters = [];
    if (intro?.start !== 0 || intro?.end !== 0) {
      chapters.push({ start: intro.start, end: intro.end, title: 'intro' });
    }
    if (outro?.start !== 0 || outro?.end !== 0) {
      chapters.push({ start: outro.start, end: outro.end, title: 'outro' });
    }
    return chapters;
  };

  const handleKeydown = (event, art) => {
    const tagName = event.target.tagName.toLowerCase();

    if (tagName === 'input' || tagName === 'textarea') return;

    switch (event.key.toLowerCase()) {
      case KEY_CODES.M:
        art.muted = !art.muted;
        break;
      case KEY_CODES.I:
        art.pip = !art.pip;
        break;
      case KEY_CODES.F:
        event.preventDefault();
        event.stopPropagation();
        art.fullscreen = !art.fullscreen;
        break;
      case KEY_CODES.V:
        event.preventDefault();
        event.stopPropagation();
        art.subtitle.show = !art.subtitle.show;
        break;
      case KEY_CODES.SPACE:
        event.preventDefault();
        event.stopPropagation();
        art.playing ? art.pause() : art.play();
        break;
      case KEY_CODES.ARROW_UP:
        event.preventDefault();
        event.stopPropagation();
        art.volume = Math.min(art.volume + 0.1, 1);
        break;
      case KEY_CODES.ARROW_DOWN:
        event.preventDefault();
        event.stopPropagation();
        art.volume = Math.max(art.volume - 0.1, 0);
        break;
      case KEY_CODES.ARROW_RIGHT:
        event.preventDefault();
        event.stopPropagation();
        art.currentTime = Math.min(art.currentTime + 10, art.duration);
        break;
      case KEY_CODES.ARROW_LEFT:
        event.preventDefault();
        event.stopPropagation();
        art.currentTime = Math.max(art.currentTime - 10, 0);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!streamUrl || !artRef.current) return;
    const iframeUrl = streamInfo?.streamingLink?.iframe;
    const headers = {};
    if (iframeUrl) {
      const url = new URL(iframeUrl);
      headers.Referer = url.origin + '/';
    } else {
      headers.Referer = 'https://megacloud.club/';
    }

    const fullURL =
      m3u8proxy +
      encodeURIComponent(streamUrl) +
      '&headers=' +
      encodeURIComponent(JSON.stringify(headers));

    const art = new Artplayer({
      url: fullURL,
      container: artRef.current,
      type: 'm3u8',
      // autoplay: autoPlay,
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
      theme: '#ff640a',
      plugins: [
        artplayerPluginHlsControl({
          quality: {
            setting: true,
            getName: (level) => level.height + 'P',
            title: 'Quality',
            auto: 'Auto',
          },
        }),
        artplayerPluginUploadSubtitle(),
        artplayerPluginChapter({ chapters: createChapters() }),
      ],
      subtitle: {
        style: {
          'font-weight': '400',
          height: 'fit-content',
          minWidth: 'fit-content',
          marginInline: 'auto',
          'margin-top': 'auto',
          'margin-bottom': '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#fff',
        },
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
            opacity: 1,
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
            top: 0,
            width: '20%',
            height: '100%',
            transform: 'translateX(-50%)',
          },
          disable: !Artplayer.utils.isMobile,
          click: function () {
            art.toggle();
          },
        },
        {
          name: 'rewind',
          html: '',
          style: {
            position: 'absolute',
            left: 0,
            top: 0,
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
            right: 0,
            top: 0,
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
            opacity: 0,
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
            opacity: 0,
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
            zIndex: 9999,
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          click: () => {
            art.currentTime = intro.end;
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
            zIndex: 9999,
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          click: () => {
            const next = episodes[currentEpisodeIndex + 1];
            if (next) {
              playNext(next.id.match(/ep=(\d+)/)?.[1]);
            } else {
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
    art.on('ready', () => {
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
      }, 3500);

      art.on('video:timeupdate', () => {
        if (art.currentTime >= intro.start && art.currentTime <= intro.end) {
          skipIntroBtn.style.display = 'block';
        } else {
          skipIntroBtn.style.display = 'none';
        }
        if (art.currentTime >= outro.start && art.currentTime <= outro.end) {
          skipOutroBtn.style.display = 'block';
        } else {
          skipOutroBtn.style.display = 'none';
        }
      });

      // setTimeout(() => {
      //   art.layers[website_name].style.opacity = 0;
      // }, 2000);

      const ranges = [
        ...(intro.start != null && intro.end != null
          ? [[intro.start + 1, intro.end - 1]]
          : []),
        ...(outro.start != null && outro.end != null
          ? [[outro.start + 1, outro.end]]
          : []),
      ];
      document.addEventListener('keydown', (event) =>
        handleKeydown(event, art)
      );
      art.subtitle.style({
        fontSize:
          (art.width > 500 ? art.width * 0.02 : art.width * 0.03) + 'px',
      });
      thumbnail &&
        art.plugins.add(
          artplayerPluginVttThumbnail({
            vtt: `${proxy}${thumbnail}`,
          })
        );
      const defaultEnglishSub =
        subtitles.find(
          (sub) => sub.label.toLowerCase() === 'english' && sub.default
        ) || subtitles.find((sub) => sub.label.toLowerCase() === 'english');
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
      // {
      //   autoSkipIntro && art.plugins.add(autoSkip(ranges));
      // }
      const defaultSubtitle = subtitles?.find(
        (sub) => sub.label.toLowerCase() === 'english'
      );
      if (defaultSubtitle) {
        art.subtitle.switch(defaultSubtitle.file, {
          name: defaultSubtitle.label,
          default: true,
        });
      }
      const $rewind = art.layers['rewind'];
      const $forward = art.layers['forward'];
      Artplayer.utils.isMobile &&
        art.proxy($rewind, 'dblclick', () => {
          art.currentTime = Math.max(0, art.currentTime - 10);
          art.layers['backwardIcon'].style.opacity = 1;
          setTimeout(() => {
            art.layers['backwardIcon'].style.opacity = 0;
          }, 300);
        });
      Artplayer.utils.isMobile &&
        art.proxy($forward, 'dblclick', () => {
          art.currentTime = Math.max(0, art.currentTime + 10);
          art.layers['forwardIcon'].style.opacity = 1;
          setTimeout(() => {
            art.layers['forwardIcon'].style.opacity = 0;
          }, 300);
        });

      console.log('READY FIRED');
      console.log('Layers:', art.layers);
      console.log('Logo layer:', art.layers.siteLogo);
    });

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
      const continueWatching =
        JSON.parse(localStorage.getItem('continueWatching')) || [];

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
        (item) => item.data_id === newEntry.data_id
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamUrl, subtitles, intro, outro]);

  return <div ref={artRef} className="w-full h-full relative"></div>;
}
