

import type { StreamingType } from '@/shared/types/StreamingTypes';
import { buildM3u8ProxyRequestUrl } from '@/lib/m3u8ProxyPublicBase';
import { urlIsCrysolineHostedStream } from '@/lib/streamMediaType';

export type WatchProbeRequestLang = 'sub' | 'dub';

export interface WatchProbeConfig {
  masterMs: number;
  variantMs: number;

  skipVariant: boolean;
}

function clampMs(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(45_000, Math.max(1200, Math.floor(value)));
}

export function readWatchProbeConfig(requestedLang: WatchProbeRequestLang): WatchProbeConfig {
  const masterRaw = Number(process.env.WATCH_PROBE_MASTER_MS);
  const variantRaw = Number(process.env.WATCH_PROBE_VARIANT_MS);
  const envRaw = process.env.WATCH_PROBE_SKIP_VARIANT?.trim().toLowerCase();

  let skipVariant: boolean;
  if (envRaw === '1' || envRaw === 'true') {
    skipVariant = true;
  } else if (envRaw === '0' || envRaw === 'false') {
    skipVariant = false;
  } else {
    skipVariant = requestedLang === 'dub';
  }

  return {
    masterMs: clampMs(masterRaw, 3200),
    variantMs: clampMs(variantRaw, 2400),
    skipVariant,
  };
}

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

    }
  }
  return {
    Referer: 'https://anikai.to/',
    Origin: 'https://anikai.to',
  };
}

export interface HlsProxyProbeResult {
  ok: boolean;

  masterPlaylistText: string | null;
}

export function hlsMasterSuggestsDubLikeAudio(masterText: string): boolean {
  if (!masterText.includes('#EXTM3U')) return false;
  const audioLines = masterText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.includes('#EXT-X-MEDIA:TYPE=AUDIO'));
  if (audioLines.length === 0) return true;
  if (audioLines.length >= 2) return true;

  const line = audioLines[0].toLowerCase();
  if (
    line.includes('language="en"') ||
    line.includes("language='en'") ||
    line.includes('language=en,')
  ) {
    return true;
  }
  if (
    line.includes('english') ||
    line.includes(' eng,') ||
    line.includes(',eng,') ||
    line.includes(' eng ') ||
    /\beng dub\b/.test(line) ||
    line.includes('simuldub') ||
    line.includes('funimation') ||
    /\bdub\b/.test(line)
  ) {
    return true;
  }
  return false;
}

export function isMirunoDubHlsManifestCheckEnabled(): boolean {
  const v = process.env.MIRUNO_DUB_HLS_MANIFEST_CHECK?.trim().toLowerCase();
  return v === '1' || v === 'true';
}

export async function probeHlsStreamViaProxy(
  origin: string,
  stream: StreamingType,
  cfg: WatchProbeConfig
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
      })()
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

function streamUrlLooksLikeHls(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes('.m3u8') || u.includes('mpegurl');
}

export async function isPlayableViaProxy(
  origin: string,
  stream: StreamingType,
  cfg: WatchProbeConfig
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
