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

export interface HlsProxyProbeResult {
  ok: boolean;
  /** Текст першого відповідного m3u8 (master або media), якщо `ok`. */
  masterPlaylistText: string | null;
}

/**
 * Евристика для master HLS: чи є ознаки **окремої** англомовної / dub аудіо
 * (`#EXT-X-MEDIA:TYPE=AUDIO`), а не лише саби в JSON Miruno.
 *
 * - Немає рядків `TYPE=AUDIO` — зазвичай аудіо змультиплексоване в відео; повертаємо **true** (не блокуємо).
 * - Два і більше `TYPE=AUDIO` — часто multi-audio (типово sub+dub); **true**.
 * - Один `TYPE=AUDIO` — **true** лише якщо в рядку є натяк на EN / dub.
 */
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

/**
 * Перевірка, що плейлист віддається через наш проксі (як у плеєрі).
 * Повертає також текст master/media playlist для додаткових перевірок (Miruno dub).
 */
export async function probeHlsStreamViaProxy(
  origin: string,
  stream: StreamingType,
  cfg: WatchProbeConfig
): Promise<HlsProxyProbeResult> {
  const streamUrl = stream.link?.file?.trim();
  if (!streamUrl) return { ok: false, masterPlaylistText: null };

  const probeUrl = new URL('/api/m3u8-proxy', origin);
  probeUrl.searchParams.set('url', streamUrl);
  probeUrl.searchParams.set('headers', JSON.stringify(buildProbeHeaders(stream)));

  try {
    const res = await fetch(probeUrl.toString(), {
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

    /** Вже медіа-плейлист — не потрібен другий hop. */
    if (text.includes('#EXTINF')) return { ok: true, masterPlaylistText: text };

    /** Один рівень без variant (рідко, але швидко). */
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
      return { ok: true, masterPlaylistText: text };
    } catch {
      return { ok: false, masterPlaylistText: text };
    }
  } catch {
    return { ok: false, masterPlaylistText: null };
  }
}

/**
 * Перевірка, що плейлист віддається через наш проксі (як у плеєрі).
 * Оптимізації: медіа-плейлист (#EXTINF) без другого hop; кілька variant рядків — Promise.any.
 */
export async function isPlayableViaProxy(
  origin: string,
  stream: StreamingType,
  cfg: WatchProbeConfig
): Promise<boolean> {
  const r = await probeHlsStreamViaProxy(origin, stream, cfg);
  return r.ok;
}
