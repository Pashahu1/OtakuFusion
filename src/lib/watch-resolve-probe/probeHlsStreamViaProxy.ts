import { buildM3u8ProxyRequestUrl } from '@/lib/m3u8ProxyPublicBase';
import { urlIsCrysolineHostedStream } from '@/lib/streamMediaType';
import type { StreamingType } from '@/shared/types/StreamingTypes';

import type { HlsProxyProbeResult, WatchProbeConfig } from './watchProbeTypes';
import { buildProbeHeaders } from './watchProbeHeaders';

export async function probeHlsStreamViaProxy(
  origin: string,
  stream: StreamingType,
  cfg: WatchProbeConfig,
): Promise<HlsProxyProbeResult> {
  const streamUrl = stream.link?.file?.trim();
  if (!streamUrl) return { ok: false, masterPlaylistText: null };

  const headers = buildProbeHeaders(stream);
  const directCrysoline = urlIsCrysolineHostedStream(streamUrl);
  const probeUrl = directCrysoline
    ? streamUrl
    : buildM3u8ProxyRequestUrl(origin, streamUrl, headers);

  try {
    const res = await fetch(probeUrl, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(cfg.masterMs),
    });
    if (!res.ok) return { ok: false, masterPlaylistText: null };

    const contentType = res.headers.get('content-type')?.toLowerCase() ?? '';
    const isPlaylistType =
      contentType.includes('mpegurl') ||
      contentType.includes('vnd.apple.mpegurl') ||
      contentType.includes('application/octet-stream');
    if (!isPlaylistType) return { ok: false, masterPlaylistText: null };

    const text = await res.text();
    if (!text.includes('#EXTM3U')) return { ok: false, masterPlaylistText: null };

    if (text.includes('#EXTINF')) return { ok: true, masterPlaylistText: text };

    if (!text.includes('#EXT-X-STREAM-INF')) return { ok: true, masterPlaylistText: text };

    if (cfg.skipVariant) return { ok: true, masterPlaylistText: text };

    const variantLines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'))
      .slice(0, 4);

    if (!variantLines.length) return { ok: false, masterPlaylistText: text };

    const variantTasks = variantLines.map((line) =>
      (async () => {
        const variantProbeUrl = new URL(line, probeUrl);
        const variantRes = await fetch(variantProbeUrl.toString(), {
          method: 'GET',
          cache: 'no-store',
          signal: AbortSignal.timeout(cfg.variantMs),
        });
        if (!variantRes.ok) throw new Error('variant_not_ok');
        return true;
      })(),
    );

    try {
      await Promise.any(variantTasks);
      return { ok: true, masterPlaylistText: text };
    } catch {
      return { ok: false, masterPlaylistText: text };
    }
  } catch {
    return { ok: false, masterPlaylistText: null };
  }
}
