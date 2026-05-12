import Artplayer from 'artplayer';
import { SERVER_PRIORITY_ORDER } from '@/shared/data/servers';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { captionIcon, serverIcon } from './PlayerIcons';
import { ANIKAI_PAGE_REFERER, LOGO_HIDE_DELAY_MS, M3U8_PROXY_URL, PROXY_URL } from './playerConstants';
import { artplayerPluginVttThumbnail } from './artPlayerPluginVttThumbnail';
import { handlePlayerKeydown } from './playerKeydown';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { Segment } from '@/shared/types/VideoSegmentsTypes';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import {
  readSubtitlePreference,
  writeSubtitlePreference,
} from './playerPlaybackPreferences';

function toPlayableAssetUrl(url: string): string {
  const raw = url.trim();
  if (!raw) return raw;
  if (raw.startsWith('blob:') || raw.startsWith('data:')) return raw;
  if (!/^https?:\/\//i.test(raw)) return raw;
  const proxyBase = (PROXY_URL || M3U8_PROXY_URL || '/api/m3u8-proxy?url=').trim();
  if (!proxyBase) return raw;
  const encoded = encodeURIComponent(raw);
  const headers = encodeURIComponent(
    JSON.stringify({
      Referer: ANIKAI_PAGE_REFERER,
      Origin: 'https://anikai.to',
    })
  );
  if (proxyBase.includes('{url}')) {
    const withUrl = proxyBase.replace('{url}', encoded);
    if (withUrl.includes('headers=')) return withUrl;
    const sep = withUrl.includes('?') ? '&' : '?';
    return `${withUrl}${sep}headers=${headers}`;
  }
  if (proxyBase.endsWith('=')) {
    return `${proxyBase}${encoded}&headers=${headers}`;
  }
  if (proxyBase.includes('?')) {
    const sep = proxyBase.endsWith('?') || proxyBase.endsWith('&') ? '' : '&';
    return `${proxyBase}${sep}url=${encoded}&headers=${headers}`;
  }
  if (proxyBase.endsWith('/')) {
    return `${proxyBase}${encoded}?headers=${headers}`;
  }
  return `${proxyBase}?url=${encoded}&headers=${headers}`;
}

export function setupPlayerReady(
  art: Artplayer,
  playNextPropRef: React.RefObject<(episodeId: string) => void>,
  episodeIdRef: React.RefObject<string | null>,
  thumbnail: string | null,
  episodesRef: React.RefObject<EpisodesTypes[] | null>,
  currentEpisodeIndexRef: React.RefObject<number | null | undefined>,
  hasMarkedWatchedForOutroRef: React.RefObject<boolean>,
  hasTriggeredNextRef: React.RefObject<boolean>,
  upNextDismissedRef: React.RefObject<boolean>,
  onEpisodeWatchedRef: React.RefObject<
    ((episodeId: string) => void) | null | undefined
  >,
  setActiveServerId: (id: string | null) => void,
  userPausedRef: React.RefObject<boolean>,
  artRef: React.RefObject<HTMLDivElement | null>,
  intro: Segment | null,
  outro: Segment | null,
  subtitles: SubtitleItem[] | null,
  streamLang: 'sub' | 'dub' | null,
  serversRef: React.RefObject<ServerInfo[] | null>,
  activeServerIdRef: React.RefObject<string | null>
) {
  let logoHideTimeoutId: ReturnType<typeof setTimeout> | null = null;
  const goToNextEpisode = () => {
    if (hasTriggeredNextRef.current) return;
    const id = episodeIdRef.current;
    const list = episodesRef.current;
    const idx = currentEpisodeIndexRef.current ?? -1;
    const epId = id != null ? String(id) : '';
    if (epId) onEpisodeWatchedRef.current?.(epId);
    const next = list?.[idx + 1];
    if (!next) return;
    const nextId = getEpisodeNumberFromId(next.id);
    if (!nextId) return;
    hasTriggeredNextRef.current = true;
    playNextPropRef.current?.(nextId);
  };

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
  const upNextRoot = art.layers['upNext'] as HTMLDivElement | undefined;

  if (upNextRoot && !upNextRoot.dataset.ofUpnextBound) {
    upNextRoot.dataset.ofUpnextBound = '1';
    upNextRoot
      .querySelector('[data-upnext-play]')
      ?.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        goToNextEpisode();
      });
    upNextRoot
      .querySelector('[data-upnext-cancel]')
      ?.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        upNextDismissedRef.current = true;
        upNextRoot.style.display = 'none';
      });
  }

  requestAnimationFrame(() => {
    logoLayer.style.opacity = '1';
    logoLayer.style.transform = 'translateY(0) scale(1)';
  });

  logoHideTimeoutId = setTimeout(() => {
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
    const cdEl = upNextRoot?.querySelector(
      '[data-upnext-countdown]'
    ) as HTMLDivElement | null;

    if (!upNextRoot || !hasNextEpisode || !Number.isFinite(duration) || duration <= 0) {
      if (upNextRoot) upNextRoot.style.display = 'none';
    } else if (upNextDismissedRef.current) {
      upNextRoot.style.display = 'none';
    } else {
      const tailStart = Math.max(0, duration - 15);
      if (art.currentTime >= tailStart && art.currentTime < duration) {
        upNextRoot.style.display = 'flex';
        const left = Math.max(0, Math.ceil(duration - art.currentTime));
        if (cdEl) cdEl.textContent = left <= 0 ? '0 с' : `${left} с`;
        if (left <= 0) goToNextEpisode();
      } else if (art.currentTime < tailStart) {
        upNextRoot.style.display = 'none';
      }
    }
  });

  const onKeydown = (event: KeyboardEvent) => {
    handlePlayerKeydown(event, art);
  };
  document.addEventListener('keydown', onKeydown);
  art.on('destroy', () => {
    document.removeEventListener('keydown', onKeydown);
    if (logoHideTimeoutId) {
      clearTimeout(logoHideTimeoutId);
      logoHideTimeoutId = null;
    }
  });
  art.subtitle.style({
    fontSize: (art.width > 500 ? art.width * 0.02 : art.width * 0.03) + 'px',
  });
  thumbnail &&
    art.plugins.add(
      artplayerPluginVttThumbnail({
        vtt: toPlayableAssetUrl(thumbnail),
      })
    );
  const playableSubtitles = (subtitles ?? [])
    .map((sub) => ({
      ...sub,
      file: toPlayableAssetUrl(sub.file),
    }))
    .filter((sub) => sub.file.trim().length > 0);
  const defaultEnglishSub =
    playableSubtitles.find(
      (sub) => sub.label.toLowerCase().includes('english') && sub.default
    ) ||
    playableSubtitles.find((sub) =>
      sub.label.toLowerCase().includes('english')
    );
  const subPref = readSubtitlePreference();
  const streamWantsSub = streamLang !== 'dub';
  let shouldShowSub = streamWantsSub;
  if (subPref?.mode === 'off') shouldShowSub = false;
  if (subPref?.mode === 'on') shouldShowSub = true;

  let defaultSubtitle: (typeof playableSubtitles)[0] | null = null;
  if (shouldShowSub) {
    if (subPref?.mode === 'on' && subPref.label.trim()) {
      const match = playableSubtitles.find(
        (s) => s.label.trim().toLowerCase() === subPref.label.trim().toLowerCase()
      );
      defaultSubtitle = match ?? defaultEnglishSub ?? playableSubtitles[0] ?? null;
    } else {
      defaultSubtitle = defaultEnglishSub ?? playableSubtitles[0] ?? null;
    }
  }

  playableSubtitles.length > 0 &&
    art.setting.add({
      name: 'captions',
      icon: captionIcon,
      html: 'Subtitle',
      tooltip: defaultSubtitle?.label ?? 'None',
      position: 'right',
      selector: [
        {
          html: 'Display',
          switch: shouldShowSub && Boolean(defaultSubtitle),
          onSwitch: function (item) {
            const isEnabled = Boolean(item.switch);
            item.tooltip = isEnabled ? 'Hide' : 'Show';
            art.subtitle.show = isEnabled;
            if (!isEnabled) writeSubtitlePreference({ mode: 'off' });
            return isEnabled;
          },
        },
        {
          html: 'None',
          default: !defaultSubtitle,
          url: '',
        },
        ...playableSubtitles.map((sub) => ({
          default: Boolean(defaultSubtitle && sub === defaultSubtitle),
          html: sub.label,
          url: sub.file,
        })),
      ],
      onSelect: function (item: { html?: string; url?: string }) {
        if (!item.url?.trim()) {
          art.subtitle.show = false;
          writeSubtitlePreference({ mode: 'off' });
          return item.html ?? 'None';
        }
        const label = item.html?.trim() ?? 'Subtitle';
        art.subtitle.switch(item.url, { name: label });
        art.subtitle.show = true;
        writeSubtitlePreference({ mode: 'on', label });
        return label;
      },
    });
  if (defaultSubtitle) {
    art.subtitle.switch(defaultSubtitle.file, {
      name: defaultSubtitle.label,
      default: true,
    } as { name: string; default?: boolean });
    art.subtitle.show = true;
  } else {
    art.subtitle.show = false;
  }

  const langServers = serversRef.current ?? null;
  const langActiveId = activeServerIdRef.current ?? null;

  /** Частина після «Sub ·» / «Dub ·» — як у useWatchStream (не порівнювати з сирими «HD-1»). */
  function mirrorLabel(serverName: string): string {
    const parts = serverName.split('·');
    if (parts.length >= 2) return parts.slice(1).join('·').trim();
    return serverName.trim();
  }

  function pickPreferredInGroup(list: ServerInfo[]): ServerInfo | undefined {
    if (!list.length) return undefined;
    for (const pref of SERVER_PRIORITY_ORDER) {
      const p = pref.toLowerCase();
      const hit = list.find(
        (s) => mirrorLabel(s.serverName).toLowerCase() === p
      );
      if (hit) return hit;
    }
    return list[0];
  }

  const subList = langServers?.filter((s) => s.type === 'sub') ?? [];
  const dubList = langServers?.filter((s) => s.type === 'dub') ?? [];
  /** Спочатку рядок, що відповідає активному стріму — меню Language збігається з реальним сервером. */
  const jp =
    subList.find((s) => String(s.data_id) === String(langActiveId)) ??
    pickPreferredInGroup(subList);
  const en =
    dubList.find((s) => String(s.data_id) === String(langActiveId)) ??
    pickPreferredInGroup(dubList);
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
