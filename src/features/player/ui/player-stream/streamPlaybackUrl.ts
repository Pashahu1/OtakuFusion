import { resolveStreamPlaybackUrl } from '@/lib/m3u8ProxyPublicBase';
import { ANIKAI_PAGE_REFERER } from '../playerConstants';
import { isHlsDirectHostUrl } from './hlsDirectHost';

export function getStreamFullUrl(
  streamUrl: string,
  headers: Record<string, string>,
): string {
  return resolveStreamPlaybackUrl(streamUrl, headers, isHlsDirectHostUrl);
}

/** Subtitles, VTT thumbnails — same proxy/direct rules as main stream. */
export function resolveAssetPlaybackUrl(
  url: string,
  requestHeaders?: Record<string, string>,
): string {
  const raw = url.trim();
  if (!raw) return raw;
  if (raw.startsWith('blob:') || raw.startsWith('data:')) return raw;
  if (!/^https?:\/\//i.test(raw)) return raw;
  const headerPayload =
    requestHeaders && Object.keys(requestHeaders).length > 0
      ? requestHeaders
      : {
          Referer: ANIKAI_PAGE_REFERER,
          Origin: 'https://anikai.to',
        };
  return resolveStreamPlaybackUrl(raw, headerPayload, isHlsDirectHostUrl);
}
