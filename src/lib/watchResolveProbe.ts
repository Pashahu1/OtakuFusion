/**
 * Швидка перевірка HLS через локальний /api/m3u8-proxy під час резолву watch.
 * Таймаути та режими керуються env (див. `readWatchProbeConfig`).
 */

import type { StreamingType } from '@/shared/types/StreamingTypes';

/** Мова запиту GET /api/watch/resolve — керує дефолтом probe для dub vs sub. */
export type WatchProbeRequestLang = 'sub' | 'dub';

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

/**
 * Таймаути та skip variant для `isPlayableViaProxy` під час watch/resolve.
 *
 * **WATCH_PROBE_SKIP_VARIANT** (опційно): `1`/`true` — завжди skip variant (sub і dub);
 * `0`/`false` — ніколи не skip (повний probe). Якщо змінна **не задана**: для **dub**
 * за замовчуванням skip variant (швидший резолв), для **sub** — перевірка variant як раніше.
 *
 * Підкрутити час: WATCH_PROBE_MASTER_MS, WATCH_PROBE_VARIANT_MS.
 */
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

/** Заголовки для проксі та поля `request_headers` у відповіді резолву. */
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
          /* ignore */
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
