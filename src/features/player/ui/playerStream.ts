/** Animepahe (Crysoline): сумісність плейлистів часто зривається на hls.js > 1.5.x — див. pinned у package.json. */
import Hls from 'hls.js';
import Artplayer from 'artplayer';
import { buildM3u8ProxyPlaylistUrl } from '@/lib/m3u8ProxyPublicBase';
import {
  DEFAULT_REFERER,
  HLS_CDN_FALLBACK_ORIGIN,
  HLS_CDN_FALLBACK_REFERER,
} from './playerConstants';

interface StreamInfoForHeaders {
  streamingLink?: Array<{ iframe?: string; request_headers?: Record<string, string> }> | unknown;
}

function playlistSuggestsThirdPartyCdn(playlistUrl: string): boolean {
  const u = playlistUrl.toLowerCase();
  return (
    u.includes('.m3u8') &&
    (u.includes('nnr') ||
      u.includes('kwik') ||
      u.includes('crysoline') ||
      u.includes('crycloud') ||
      u.includes('lab.site') ||
      u.includes('rapid') ||
      u.includes('mcloud') ||
      u.includes('megacdn') ||
      u.includes('code29wave') ||
      u.includes('megaup') ||
      u.includes('owocdn') ||
      u.includes('libria.fun'))
  );
}

function pickStreamingLinkForPlaylist(
  streamInfo: StreamInfoForHeaders | null,
  playlistUrl?: string | null
):
  | { iframe?: string; request_headers?: Record<string, string> }
  | undefined {
  const streamLinkRaw = streamInfo?.streamingLink as
    | { iframe?: string; request_headers?: Record<string, string>; link?: { file?: string } }
    | Array<{
        iframe?: string;
        request_headers?: Record<string, string>;
        link?: { file?: string };
      }>
    | undefined;
  if (!streamLinkRaw) return undefined;
  if (!Array.isArray(streamLinkRaw)) return streamLinkRaw;
  const p = playlistUrl?.trim();
  if (p) {
    const hit = streamLinkRaw.find(
      (item) => item && typeof item === 'object' && item.link?.file?.trim() === p
    );
    if (hit) return hit;
  }
  return streamLinkRaw.find((item) => item && typeof item === 'object');
}

/**
 * Заголовки для M3U8-проксі: `request_headers` з API, інакше Referer під embed або резерв Animepahe/kwik.
 */
export function getStreamHeaders(
  streamInfo: StreamInfoForHeaders | null,
  playlistUrl?: string | null
): Record<string, string> {
  const headers: Record<string, string> = {};
  const firstLink = pickStreamingLinkForPlaylist(streamInfo, playlistUrl);
  const requestHeaders = firstLink?.request_headers;
  if (requestHeaders && typeof requestHeaders === 'object') {
    for (const [key, value] of Object.entries(requestHeaders)) {
      if (typeof key !== 'string' || !key.trim()) continue;
      if (typeof value !== 'string' || !value.trim()) continue;
      headers[key] = value;
    }
    if (Object.keys(headers).length > 0) return headers;
  }
  const iframeUrl = firstLink?.iframe;

  if (iframeUrl) {
    try {
      const url = new URL(iframeUrl);
      const origin = url.origin;
      headers.Referer = `${origin}/`;
      headers.Origin = origin;
    } catch {
      headers.Referer = DEFAULT_REFERER;
    }
  } else if (
    typeof playlistUrl === 'string' &&
    playlistUrl.trim() &&
    playlistSuggestsThirdPartyCdn(playlistUrl)
  ) {
    headers.Referer = HLS_CDN_FALLBACK_REFERER;
    headers.Origin = HLS_CDN_FALLBACK_ORIGIN;
  } else {
    headers.Referer = DEFAULT_REFERER;
  }

  return headers;
}

/** Домени HLS, які безпечніше тягнути з клієнта напряму (не через /api/m3u8-proxy) — інакше кожен сегмент б’є по Vercel Fast Origin Transfer. */
const HLS_DIRECT_HOST_SUFFIXES_BUILTIN = [] as const;

function readHlsDirectHostSuffixes(): string[] {
  const raw =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_HLS_DIRECT_HOST_SUFFIXES?.trim()
      : '';
  const fromEnv = raw
    ? raw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of [...HLS_DIRECT_HOST_SUFFIXES_BUILTIN, ...fromEnv]) {
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function hostMatchesHlsDirectSuffix(hostname: string, suffixes: string[]): boolean {
  for (const suf of suffixes) {
    if (!suf) continue;
    if (hostname === suf) return true;
    if (suf.startsWith('.') && hostname.endsWith(suf)) return true;
    if (hostname.endsWith(`.${suf}`)) return true;
  }
  return false;
}

/** Пряме завантаження з браузера (CORS дозволений) — головний плейлист, субтитри, прев’ю. */
export function isHlsDirectHostUrl(streamUrl: string): boolean {
  const raw = streamUrl.trim();
  if (!raw || !/^https?:\/\//i.test(raw)) return false;
  const suffixes = readHlsDirectHostSuffixes();
  if (!suffixes.length) return false;
  try {
    const host = new URL(raw).hostname.toLowerCase();
    return hostMatchesHlsDirectSuffix(host, suffixes);
  } catch {
    return false;
  }
}

export function getStreamFullUrl(
  streamUrl: string,
  headers: Record<string, string>
): string {
  if (isHlsDirectHostUrl(streamUrl)) {
    return streamUrl;
  }
  return buildM3u8ProxyPlaylistUrl(streamUrl, headers);
}

export interface PlayM3u8Hooks {
  /**
   * Після `new Hls`, **до** `loadSource`: підписатися на `MANIFEST_PARSED`, зафіксувати рівень і викликати
   * `hls.startLoad()` (при `autoStartLoad: false` у конфігу) — інакше перші фрагменти йдуть у гонці з ABR.
   */
  onHlsBeforeLoad?: (hls: InstanceType<typeof Hls>) => void;
  /** Викликається синхронно після `art.hls = hls` (Artplayer ставить url асинхронно — зовні `art.hls` одразу після `new Artplayer` ще може бути `null`). */
  onHlsInstance?: (hls: InstanceType<typeof Hls>) => void;
}

export function playM3u8(
  video: HTMLVideoElement,
  url: string,
  art: Artplayer,
  hooks?: PlayM3u8Hooks
): void {
  if (Hls.isSupported()) {
    if (art.hls) art.hls.destroy();
    // VoD: стабільний буфер на нестабільних/проксі-серверах.
    // `autoStartLoad: false` + `startLoad()` у `MANIFEST_PARSED` (див. onHlsBeforeLoad): інакше ABR
    // інколи встигає запросити «чужий» рівень до фіксації — bufferAddCodec / bufferAppend на owocdn.
    const hls = new Hls({
      /**
       * У Chromium `enableWorker: true` інколи дає `bufferAddCodecError` / `bufferAppendError` на деяких
       * CDN (owocdn / «.jpg»-сегменти) — трансмукс у головному потоці надійніший.
       */
      enableWorker: false,
      /**
       * `true` на частині збірок Chromium дає `bufferAddCodecError` / `bufferAppendError` на HLS (owocdn / fMP4).
       * Класичний MediaSource стабільніший для цього пайплайну.
       */
      preferManagedMediaSource: false,
      /**
       * Через власний m3u8-проксі сегменти часто йдуть повільніше: мало ретраїв + короткий таймаут
       * дають «сіра смуга завмерла одразу після playhead» — hls.js перестає підвантажувати далі.
       * Ретраї обмежені, щоб при жорсткому 4xx не зациклити тисячі XHR (fallback лишається в React).
       */
      manifestLoadingMaxRetry: 2,
      levelLoadingMaxRetry: 3,
      fragLoadingMaxRetry: 5,
      fragLoadingMaxRetryTimeout: 120000,
      manifestLoadingRetryDelay: 400,
      levelLoadingRetryDelay: 400,
      fragLoadingRetryDelay: 400,
      manifestLoadingTimeOut: 15000,
      levelLoadingTimeOut: 28000,
      fragLoadingTimeOut: 45000,
      /**
       * VoD: ціль у секундах уперед від playhead. Разом із maxBufferSize задає, скільки «наперед»
       * тримаємо (орієнтовно десятки секунд — кілька хв залежно від бітрейту).
       */
      maxBufferLength: 120,
      maxMaxBufferLength: 900,
      /**
       * Жорсткий ліміт буфера в байтах: при 1080p часто спрацьовує раніше за maxBufferLength.
       */
      maxBufferSize: 256 * 1024 * 1024,
      /** Дозволяємо невеликі дірки між сегментами, щоб рідше «застрягати» без appends. */
      maxBufferHole: 0.85,
      lowLatencyMode: false,
      /**
       * false: не тягнути сегменти до `MANIFEST_PARSED` + `startLoad()` у хості — інакше перший init
       * інколи йде не з того рівня, що зафіксовано в `applyInitialLevelOnce` (гонка з ABR).
       */
      autoStartLoad: false,
      /** Старт з нижнього рунду; фактичний рівень одразу підміняється в `MANIFEST_PARSED`. */
      startLevel: 0,
      /** false: префетч іншого рівня під час ABR інколи змішує init-сегменти → append/codec помилки на owocdn. */
      startFragPrefetch: false,
      /** Не піднімати сходинку вище за розмір відео — менше стрибків кодека на вузькому вікні. */
      capLevelToPlayerSize: true,
      /** Повільніший «набір» якості після старту — стабільніший MSE на чужих CDN. */
      abrBandWidthUpFactor: 2.4,
      abrBandWidthFactor: 0.92,
      maxStarvationDelay: 12,
      maxLoadingDelay: 12,
      /**
       * Стартовий оцінювач бітрейту (б/с). Занижений відносно 1080p, щоб до застосування cap у плеєрі
       * рідше підхоплювався найвищий рівень одразу після парсу маніфесту.
       */
      abrEwmaDefaultEstimate: 2_000_000,
      /** Менше тримаємо позад playhead — трохи більше бюджету на фрагменти вперед на слабких пристроях. */
      backBufferLength: 45,
      ...(typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
        ? {
            /**
             * У Chrome DevTools часто видно «200 (disk cache)» для `/api/m3u8-proxy` — застарілий плейлист
             * з протухлими токенами дає фатальні помилки Hls після нашого виправлення підписки на ERROR.
             */
            xhrSetup(xhr: XMLHttpRequest, url: string) {
              const pub = process.env.NEXT_PUBLIC_M3U8_PROXY_URL?.trim() ?? '';
              let externalHost: string | null = null;
              if (/^https?:\/\//i.test(pub)) {
                try {
                  externalHost = new URL(pub).hostname;
                } catch {
                  externalHost = null;
                }
              }
              const isLocalProxy = url.includes('/api/m3u8-proxy');
              const isExternalProxy =
                externalHost != null &&
                (url.includes(externalHost) || url.includes('/fetch'));
              if (isLocalProxy || isExternalProxy) {
                try {
                  xhr.setRequestHeader('Cache-Control', 'no-cache');
                  xhr.setRequestHeader('Pragma', 'no-cache');
                } catch {
                  /* ignore */
                }
              }
            },
          }
        : {}),
    });
    hooks?.onHlsBeforeLoad?.(hls);
    hls.loadSource(url);
    hls.attachMedia(video);
    art.hls = hls;
    hooks?.onHlsInstance?.(hls);
    art.on('destroy', () => hls.destroy());
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  } else if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV === 'development'
  ) {
    console.warn('Unsupported playback format: m3u8');
  }
}
