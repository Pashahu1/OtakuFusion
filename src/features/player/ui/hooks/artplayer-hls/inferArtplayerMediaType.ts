import { urlLooksLikeHlsStream, inferStreamMediaKind } from '@/lib/streamMediaType';
import type { PlayerProps } from '@/shared/types/PlayerTypes';

export function inferArtplayerMediaType(
  streamUrl: string,
  streamInfo: PlayerProps['streamInfo'],
  proxiedUrl: string,
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
