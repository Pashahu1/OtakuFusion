import { buildM3u8ProxyRequestUrl } from '@/lib/m3u8ProxyPublicBase';
import { urlIsCrysolineHostedStream } from '@/lib/streamMediaType';
import type { StreamingType } from '@/shared/types/StreamingTypes';

import { buildProbeHeaders } from './watchProbeHeaders';
import { probeHlsStreamViaProxy } from './probeHlsStreamViaProxy';
import type { WatchProbeConfig } from './watchProbeTypes';

function streamUrlLooksLikeHls(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes('.m3u8') || u.includes('mpegurl');
}

export async function isPlayableViaProxy(
  origin: string,
  stream: StreamingType,
  cfg: WatchProbeConfig,
): Promise<boolean> {
  const streamUrl = stream.link?.file?.trim();
  if (!streamUrl) return false;

  if (streamUrlLooksLikeHls(streamUrl)) {
    const r = await probeHlsStreamViaProxy(origin, stream, cfg);
    return r.ok;
  }

  const headers = buildProbeHeaders(stream);
  const probeUrl = urlIsCrysolineHostedStream(streamUrl)
    ? streamUrl
    : buildM3u8ProxyRequestUrl(origin, streamUrl, headers);

  try {
    const rangeRes = await fetch(probeUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: { Range: 'bytes=0-1' },
      signal: AbortSignal.timeout(cfg.masterMs),
    });
    if (rangeRes.ok || rangeRes.status === 206) return true;
    if (rangeRes.status !== 404 && rangeRes.status !== 416) return false;

    const fullRes = await fetch(probeUrl, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(cfg.masterMs),
    });
    return fullRes.ok;
  } catch {
    return false;
  }
}
