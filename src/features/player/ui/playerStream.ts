import Hls from 'hls.js';
import Artplayer from 'artplayer';
import {
  M3U8_PROXY_URL,
  DEFAULT_REFERER,
  ANIKAI_PAGE_REFERER,
} from './playerConstants';

interface StreamInfoForHeaders {
  streamingLink?: Array<{ iframe?: string; request_headers?: Record<string, string> }> | unknown;
}

function playlistSuggestsThirdPartyCdn(playlistUrl: string): boolean {
  const u = playlistUrl.toLowerCase();
  return (
    u.includes('.m3u8') &&
    (u.includes('nnr') ||
      u.includes('anikai') ||
      u.includes('lab.site') ||
      u.includes('rapid') ||
      u.includes('mcloud') ||
      u.includes('megacdn') ||
      u.includes('code29wave') ||
      u.includes('megaup'))
  );
}

/**
 * Заголовки для M3U8-проксі: embed з API, інакше Referer під сторінку AniKai для сторонніх CDN.
 */
export function getStreamHeaders(
  streamInfo: StreamInfoForHeaders | null,
  playlistUrl?: string | null
): Record<string, string> {
  const headers: Record<string, string> = {};
  const streamLinkRaw = streamInfo?.streamingLink as
    | { iframe?: string; request_headers?: Record<string, string> }
    | Array<{ iframe?: string; request_headers?: Record<string, string> }>
    | undefined;
  const firstLink = Array.isArray(streamLinkRaw)
    ? streamLinkRaw.find((item) => item && typeof item === 'object')
    : streamLinkRaw;
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
    headers.Referer = ANIKAI_PAGE_REFERER;
    headers.Origin = 'https://anikai.to';
  } else {
    headers.Referer = DEFAULT_REFERER;
  }

  return headers;
}

export function getStreamFullUrl(
  streamUrl: string,
  headers: Record<string, string>
): string {
  if (!M3U8_PROXY_URL) return streamUrl;
  return (
    M3U8_PROXY_URL +
    encodeURIComponent(streamUrl) +
    '&headers=' +
    encodeURIComponent(JSON.stringify(headers))
  );
}

export function playM3u8(
  video: HTMLVideoElement,
  url: string,
  art: Artplayer
): void {
  if (Hls.isSupported()) {
    if (art.hls) art.hls.destroy();
    // VoD: стабільний буфер на нестабільних/проксі-серверах.
    // Початковий рівень залишаємо на -1 (типовий ABR hls.js), без примусового 0 —
    // інакше довго тримаємося низької сходинки й потім різко стрибаємо вгору.
    const hls = new Hls({
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
      /** true: починаємо тягнути плейлист/сегменти щойно готові медіа + маніфест (менше гонки з play). */
      autoStartLoad: true,
      /** -1: вибір початкового рівня відповідає евристиці ABR (не завжди найнижчий індекс). */
      startLevel: -1,
      startFragPrefetch: true,
      maxStarvationDelay: 12,
      maxLoadingDelay: 12,
      /**
       * Стартовий оцінювач бітрейту (б/с): занадто низький → ABR «боїться» наперед і буфер росте повільно
       * на початку, особливо через проксі. 5 Mbps — розумний компроміс для 1080p VoD.
       */
      abrEwmaDefaultEstimate: 5_000_000,
      /** Менше тримаємо позад playhead — трохи більше бюджету на фрагменти вперед на слабких пристроях. */
      backBufferLength: 45,
    });
    hls.loadSource(url);
    hls.attachMedia(video);
    art.hls = hls;
    hls.startLoad(-1);
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
