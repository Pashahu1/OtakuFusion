

export type StreamMediaKind = 'hls' | 'mp4';

function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function decodeStreamUrlForInspection(streamUrl: string): string {
  let current = streamUrl.trim();
  if (!current) return current;

  for (let depth = 0; depth < 5; depth += 1) {
    let next: string | null = null;

    try {
      const base =
        typeof window !== 'undefined' ? window.location.origin : 'http://local.invalid';
      const u = new URL(current, base);
      if (u.pathname.includes('m3u8-proxy')) {
        const inner = u.searchParams.get('url')?.trim();
        if (inner && inner !== current) {
          next = decodeURIComponentSafe(inner);
        }
      }
    } catch {

    }

    if (!next) {
      const jwtStream = tryDecodeCrysolineJwtStream(current);
      if (jwtStream && jwtStream !== current) {
        next = jwtStream;
      }
    }

    if (!next || next === current) break;
    current = next;
  }

  return current;
}

function tryDecodeCrysolineJwtStream(url: string): string | null {
  try {
    const u = new URL(url);
    if (!/crysoline\.moe/i.test(u.hostname)) return null;
    const token = u.pathname.split('/').filter(Boolean).pop();
    if (!token?.includes('.')) return null;
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const padded = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (padded.length % 4)) % 4;
    const paddedFull = padded + '='.repeat(padLen);

    let jsonText: string;
    if (typeof Buffer !== 'undefined') {
      jsonText = Buffer.from(paddedFull, 'base64').toString('utf8');
    } else {
      jsonText = atob(paddedFull);
    }

    const json = JSON.parse(jsonText) as { stream?: unknown };
    return typeof json.stream === 'string' && json.stream.trim() ? json.stream.trim() : null;
  } catch {
    return null;
  }
}

export function urlLooksLikeHlsStream(url: string): boolean {
  const u = decodeStreamUrlForInspection(url).toLowerCase();
  return u.includes('.m3u8') || u.includes('mpegurl') || u.includes('/hls/');
}

export function urlLooksLikeMp4Stream(url: string): boolean {
  const u = decodeStreamUrlForInspection(url).toLowerCase();
  if (urlLooksLikeHlsStream(url)) return false;
  return u.includes('.mp4') || u.includes('/media/') || u.includes('_dnld');
}

export function inferStreamMediaKind(streamUrl: string): StreamMediaKind {
  if (urlLooksLikeMp4Stream(streamUrl)) return 'mp4';
  return 'hls';
}

export function unwrapCrysolinePlaybackUrl(streamUrl: string): string {
  const raw = streamUrl.trim();
  if (!raw) return raw;
  const inner = decodeStreamUrlForInspection(raw);
  const innerLower = inner.toLowerCase();
  if (innerLower.includes('fast4speed') || innerLower.includes('_dnld')) {
    return '';
  }
  if (inner && inner !== raw && !innerLower.includes('proxy.crysoline')) {
    return inner;
  }
  return raw;
}

export function isDeadAnicoreCdnUrl(streamUrl: string): boolean {
  const u = decodeStreamUrlForInspection(streamUrl).toLowerCase();
  return u.includes('fast4speed') || u.includes('_dnld');
}
