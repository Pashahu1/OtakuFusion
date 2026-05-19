import Artplayer from 'artplayer';
import { captionIcon } from './PlayerIcons';
import { syncPlayerLanguageMenu } from './syncPlayerLanguageMenu';
import { ANIKAI_PAGE_REFERER, LOGO_HIDE_DELAY_MS, M3U8_PROXY_URL, PROXY_URL } from './playerConstants';
import { isHlsDirectHostUrl } from './playerStream';
import { artplayerPluginVttThumbnail } from './artPlayerPluginVttThumbnail';
import { handlePlayerKeydown } from './playerKeydown';
import type { WatchStreamProvider } from '@/lib/watch-provider';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import {
  readSubtitlePreference,
  writeSubtitlePreference,
} from './playerPlaybackPreferences';

function toPlayableAssetUrl(url: string): string {
  const raw = url.trim();
  if (!raw) return raw;
  if (raw.startsWith('blob:') || raw.startsWith('data:')) return raw;
  if (!/^https?:\/\//i.test(raw)) return raw;
  /** Той самий список, що й для головного HLS — інакше субтитри/прев’ю б’ють по проксі й множать 403. */
  if (isHlsDirectHostUrl(raw)) return raw;
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

function scheduleIdle(fn: () => void): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => fn(), { timeout: 2200 });
  } else {
    setTimeout(fn, 1);
  }
}

export function setupPlayerReady(
  art: Artplayer,
  thumbnail: string | null,
  setActiveServerId: (id: string | null) => void,
  userPausedRef: React.RefObject<boolean>,
  artRef: React.RefObject<HTMLDivElement | null>,
  subtitles: SubtitleItem[] | null,
  streamLang: 'sub' | 'dub' | null,
  serversRef: React.RefObject<ServerInfo[] | null>,
  activeServerIdRef: React.RefObject<string | null>,
  watchStreamProvider: WatchStreamProvider,
  setWatchStreamProvider: (next: WatchStreamProvider) => void,
  /** Каталог Anilibria знайшов реліз — показувати пункт у меню Language. */
  anilibertyLanguageMenuEligible: boolean,
  /** Каталог Hikka Features (українська озвучка). */
  hikkaLanguageMenuEligible: boolean,
  /** Маркери OP/ED (з Anilibria або злиті в Animepahe-резолві за мапінгом). */
  skipSegments: StreamingData['skipSegments'] | null | undefined
) {
  let logoHideTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const tryPlay = () => {
    if (userPausedRef.current) return;
    if (document.visibilityState === 'visible') art.play().catch(() => {});
  };

  const MIN_BUFFER_AHEAD_SEC = 0.7;
  const MAX_BUFFER_WAIT_MS = 2800;
  const bufferWaitStarted =
    typeof performance !== 'undefined' ? performance.now() : Date.now();

  const tryPlayWhenBuffered = () => {
    if (userPausedRef.current) return;
    const v = art.video;
    if (!v) {
      tryPlay();
      return;
    }
    let ahead = 0;
    try {
      const buf = v.buffered;
      if (buf.length > 0) {
        ahead = buf.end(buf.length - 1) - v.currentTime;
      }
    } catch {
      /* noop */
    }
    const elapsed =
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
      bufferWaitStarted;
    if (ahead >= MIN_BUFFER_AHEAD_SEC || elapsed >= MAX_BUFFER_WAIT_MS) {
      tryPlay();
      return;
    }
    requestAnimationFrame(tryPlayWhenBuffered);
  };

  /** Після canplay чекаємо трохи буфера перед play — менше мікрозависань на старті HLS. */
  art.once('video:canplay', tryPlayWhenBuffered);

  art.on('pause', () => {
    userPausedRef.current = true;
    if (art.video) {
      art.video.pause();
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

  const logoLayer = art.layers.siteLogo as HTMLElement | undefined;

  const introSeg = skipSegments?.intro;
  const outroSeg = skipSegments?.outro;
  const introSkipOk =
    introSeg != null &&
    typeof introSeg.start === 'number' &&
    typeof introSeg.end === 'number' &&
    introSeg.start < introSeg.end;
  const outroSkipOk =
    outroSeg != null &&
    typeof outroSeg.start === 'number' &&
    typeof outroSeg.end === 'number' &&
    outroSeg.start < outroSeg.end;

  const seekClampedToDuration = (seconds: number) => {
    const dur = art.video?.duration ?? art.duration;
    const target = Number.isFinite(dur) && dur > 0
      ? Math.min(seconds, Math.max(0, dur - 0.05))
      : seconds;
    art.currentTime = target;
  };

  const skipRoot = art.layers['skipIntroOutro'] as HTMLDivElement | undefined;
  let skipOverlayVisible = false;

  if (skipRoot && !skipRoot.dataset.ofSkipSegmentBound) {
    skipRoot.dataset.ofSkipSegmentBound = '1';
    skipRoot.querySelector('[data-skip-segment]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const kind = skipRoot.dataset.activeKind;
      if (kind === 'intro' && introSkipOk && introSeg) {
        seekClampedToDuration(introSeg.end);
      } else if (kind === 'outro' && outroSkipOk && outroSeg) {
        seekClampedToDuration(outroSeg.end);
      }
      skipRoot.style.display = 'none';
      skipRoot.style.pointerEvents = 'none';
      skipOverlayVisible = false;
      delete skipRoot.dataset.activeKind;
    });
  }

  const syncSkipSegmentOverlay = (t: number) => {
    if (!skipRoot || (!introSkipOk && !outroSkipOk)) {
      if (skipRoot && skipOverlayVisible) {
        skipRoot.style.display = 'none';
        skipRoot.style.pointerEvents = 'none';
        skipOverlayVisible = false;
        delete skipRoot.dataset.activeKind;
      }
      return;
    }

    let nextKind: 'intro' | 'outro' | null = null;
    if (introSkipOk && introSeg && t >= introSeg.start && t < introSeg.end) {
      nextKind = 'intro';
    } else if (outroSkipOk && outroSeg && t >= outroSeg.start && t < outroSeg.end) {
      nextKind = 'outro';
    }

    if (nextKind === null) {
      if (skipOverlayVisible) {
        skipRoot.style.display = 'none';
        skipRoot.style.pointerEvents = 'none';
        skipOverlayVisible = false;
        delete skipRoot.dataset.activeKind;
      }
      return;
    }

    skipRoot.dataset.activeKind = nextKind;
    const btn = skipRoot.querySelector(
      '[data-skip-segment]'
    ) as HTMLButtonElement | null;
    if (btn) btn.textContent = nextKind === 'intro' ? 'Skip OP' : 'Skip ED';
    if (!skipOverlayVisible) {
      skipRoot.style.display = 'flex';
      skipRoot.style.pointerEvents = 'auto';
      skipOverlayVisible = true;
    }
  };

  requestAnimationFrame(() => {
    if (!logoLayer) return;
    logoLayer.style.opacity = '1';
    logoLayer.style.transform = 'translateY(0) scale(1)';
  });

  logoHideTimeoutId = setTimeout(() => {
    if (!logoLayer) return;
    logoLayer.style.opacity = '0';
    logoLayer.style.transform = 'translateY(-10px) scale(0.95)';
  }, LOGO_HIDE_DELAY_MS);

  const onTimeUpdate = () => {
    syncSkipSegmentOverlay(art.currentTime);
  };

  art.on('video:timeupdate', onTimeUpdate);

  const onKeydown = (event: KeyboardEvent) => {
    handlePlayerKeydown(event, art);
  };
  document.addEventListener('keydown', onKeydown);
  art.on('destroy', () => {
    document.removeEventListener('keydown', onKeydown);
    const emitter = art as unknown as {
      off?: (event: string, handler: () => void) => void;
    };
    emitter.off?.('video:timeupdate', onTimeUpdate);
    if (logoHideTimeoutId) {
      clearTimeout(logoHideTimeoutId);
      logoHideTimeoutId = null;
    }
  });
  art.subtitle.style({
    fontSize: (art.width > 500 ? art.width * 0.02 : art.width * 0.03) + 'px',
  });
  if (thumbnail) {
    const thumbUrl = toPlayableAssetUrl(thumbnail);
    scheduleIdle(() => {
      try {
        art.plugins.add(
          artplayerPluginVttThumbnail({
            vtt: thumbUrl,
          })
        );
      } catch {
        /* noop */
      }
    });
  }
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

  syncPlayerLanguageMenu(art, {
    serversRef,
    activeServerIdRef,
    watchStreamProvider,
    setWatchStreamProvider,
    setActiveServerId,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
  });

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
