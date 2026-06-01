import type { StreamingType } from '@/shared/types/StreamingTypes';

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
      if (out.Referer && !out.Origin) {
        try {
          out.Origin = new URL(out.Referer).origin;
        } catch {
          /* ignore invalid Referer */
        }
      }
      return out;
    }
  }

  const iframe = stream.iframe?.trim();
  if (iframe) {
    try {
      const url = new URL(iframe);
      return {
        Referer: `${url.origin}/`,
        Origin: url.origin,
      };
    } catch {
      /* ignore invalid iframe URL */
    }
  }
  return {
    Referer: 'https://anikai.to/',
    Origin: 'https://anikai.to',
  };
}
