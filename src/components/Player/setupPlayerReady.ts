import Artplayer from 'artplayer';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { captionIcon, serverIcon } from './PlayerIcons';
import { PROXY_URL } from './playerConstants';
import { artplayerPluginVttThumbnail } from './artPlayerPluginVttThumbnail';
import { handlePlayerKeydown } from './playerKeydown';
import { LOGO_HIDE_DELAY_MS } from './playerConstants';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { Segment } from '@/shared/types/VideoSegmentsTypes';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';

export function setupPlayerReady(
  art: Artplayer,
  playNextRef: React.RefObject<(episodeId: string) => void>,
  episodeIdRef: React.RefObject<string | null>,
  thumbnail: string | null,
  episodesRef: React.RefObject<EpisodesTypes[] | null>,
  currentEpisodeIndexRef: React.RefObject<number | null | undefined>,
  hasMarkedWatchedForOutroRef: React.RefObject<boolean>,
  hasTriggeredNextRef: React.RefObject<boolean>,
  onEpisodeWatchedRef: React.RefObject<
    ((episodeId: string) => void) | null | undefined
  >,
  setActiveServerId: (id: string | null) => void,
  userPausedRef: React.RefObject<boolean>,
  artRef: React.RefObject<HTMLDivElement | null>,
  intro: Segment | null,
  outro: Segment | null,
  subtitles: SubtitleItem[] | null,
  serversRef: React.RefObject<ServerInfo[] | null>,
  activeServerIdRef: React.RefObject<string | null>
) {
  const goToNextEpisode = () => {
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
    userPausedRef.current = true;
    if (art.video) {
      art.video.pause();
      art.video.currentTime = art.currentTime;
    }
    if (artRef.current) {
      artRef.current.querySelectorAll('video, audio').forEach((el) => {
        (el as HTMLMediaElement).pause();
      });
    }
  });

  art.on('play', () => {
    userPausedRef.current = false;
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
    fontSize: (art.width > 500 ? art.width * 0.02 : art.width * 0.03) + 'px',
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
        subtitles.find((sub) => sub.label.toLowerCase() === 'english')?.label ||
        'default',
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
            sub.label.toLowerCase() === 'english' && sub === defaultEnglishSub,
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
}
