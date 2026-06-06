import type { StreamingType } from '@/shared/types/StreamingTypes';
import { stripOriginFromHeaders } from '@/lib/streamProxyHeaders';

export function buildProbeHeaders(stream: StreamingType): Record<string, string> {
  const direct = stream.request_headers;
  if (direct && typeof direct === 'object') {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(direct)) {
      if (typeof k !== 'string' || !k.trim()) continue;
      if (typeof v !== 'string' || !v.trim()) continue;
      out[k.trim()] = v.trim();
    }
    if (Object.keys(out).length > 0) {
      return stripOriginFromHeaders(out);
    }
  }

  const iframe = stream.iframe?.trim();
  if (iframe) {
    try {
      const url = new URL(iframe);
      return { Referer: `${url.origin}/` };
    } catch {
      /* ignore invalid iframe URL */
    }
  }
  return { Referer: 'https://anikai.to/' };
}
