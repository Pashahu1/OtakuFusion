/**
 * Швидка перевірка HLS через локальний /api/m3u8-proxy під час резолву watch.
 * Таймаути та режими керуються env (див. readWatchProbeConfig).
 */

import type { StreamingType } from '@/shared/types/StreamingTypes';

export interface WatchProbeConfig {
  masterMs: number;
  variantMs: number;
  /** Якщо true — не перевіряти перший variant при master playlist (швидше, ризик «мертвого» рівня). */
  skipVariant: boolean;
}

function clampMs(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(45_000, Math.max(1200, Math.floor(value)));
}

export function readWatchProbeConfig(): WatchProbeConfig {
  const masterRaw = Number(process.env.WATCH_PROBE_MASTER_MS);
  const variantRaw = Number(process.env.WATCH_PROBE_VARIANT_MS);
  const skip =
    process.env.WATCH_PROBE_SKIP_VARIANT === '1' ||
    process.env.WATCH_PROBE_SKIP_VARIANT === 'true';

  return {
    masterMs: clampMs(masterRaw, 4500),
    variantMs: clampMs(variantRaw, 3500),
    skipVariant: skip,
  };
}

/** Заголовки для проксі та поля `request_headers` у відповіді резолву. */
export function buildProbeHeaders(stream: StreamingType): Record<string, string> {
  const iframe = stream.iframe?.trim();
  if (iframe) {
    try {
      const url = new URL(iframe);
      return {
        Referer: `${url.origin}/`,
        Origin: url.origin,
      };
    } catch {
      // ignore
    }
  }
  return {
    Referer: 'https://anikai.to/',
    Origin: 'https://anikai.to',
  };
}

/**
 * Перевірка, що плейлист віддається через наш проксі (як у плеєрі).
 * Оптимізації: медіа-плейлист (#EXTINF) без другого запиту; кілька variant рядків — Promise.any.
 */
export async function isPlayableViaProxy(
  origin: string,
  stream: StreamingType,
  cfg: WatchProbeConfig
): Promise<boolean> {
  const streamUrl = stream.link?.file?.trim();
  if (!streamUrl) return false;

  const probeUrl = new URL('/api/m3u8-proxy', origin);
  probeUrl.searchParams.set('url', streamUrl);
  probeUrl.searchParams.set('headers', JSON.stringify(buildProbeHeaders(stream)));

  try {
    const res = await fetch(probeUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(cfg.masterMs),
    });
    if (!res.ok) return false;

    const contentType = res.headers.get('content-type')?.toLowerCase() ?? '';
    const isPlaylistType =
      contentType.includes('mpegurl') ||
      contentType.includes('vnd.apple.mpegurl') ||
      contentType.includes('application/octet-stream');
    if (!isPlaylistType) return false;

    const text = await res.text();
    if (!text.includes('#EXTM3U')) return false;

    /** Вже медіа-плейлист — не потрібен другий hop. */
    if (text.includes('#EXTINF')) return true;

    /** Один рівень без variant (рідко, але швидко). */
    if (!text.includes('#EXT-X-STREAM-INF')) return true;

    if (cfg.skipVariant) return true;

    const variantLines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'))
      .slice(0, 4);

    if (!variantLines.length) return false;

    const variantTasks = variantLines.map((line) =>
      (async () => {
        const variantProbeUrl = new URL(line, probeUrl.toString());
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
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}
