import type { StreamingType } from '@/shared/types/StreamingTypes';
import type { VideoTrack } from '@/shared/types/VideoTrackTypes';
import {
  hlsMasterSuggestsDubLikeAudio,
  isMirunoDubHlsManifestCheckEnabled,
  probeHlsStreamViaProxy,
  type WatchProbeConfig,
} from '@/lib/watchResolveProbe';

function readMirunoApiBaseUrl(): string | null {
  const raw = process.env.MIRUNO_API_BASE_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, '');
}

interface MirunoPrimaryPick {
  url: string;
  referer?: string;
  serverLabel?: string;
}

function isHttpUrl(s: string): boolean {
  return s.startsWith('http://') || s.startsWith('https://');
}

/** Miruno Native: `{ streams: [{ url, referer, server, default }], subtitles: [...] }`. */
function extractMirunoPrimaryStream(json: Record<string, unknown>): MirunoPrimaryPick | null {
  const streams = json.streams;
  if (Array.isArray(streams) && streams.length > 0) {
    let picked: Record<string, unknown> | undefined;
    for (const row of streams) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
      const r = row as Record<string, unknown>;
      if (r.default === true) {
        picked = r;
        break;
      }
    }
    if (!picked) {
      const first = streams[0];
      if (first && typeof first === 'object' && !Array.isArray(first)) {
        picked = first as Record<string, unknown>;
      }
    }
    if (picked) {
      const rawUrl = typeof picked.url === 'string' ? picked.url.trim() : '';
      if (rawUrl && isHttpUrl(rawUrl)) {
        const referer =
          typeof picked.referer === 'string' && picked.referer.trim()
            ? picked.referer.trim()
            : undefined;
        const serverLabel =
          typeof picked.server === 'string' && picked.server.trim()
            ? picked.server.trim()
            : undefined;
        return { url: rawUrl, referer, serverLabel };
      }
    }
  }

  const direct = json.url;
  if (typeof direct === 'string') {
    const t = direct.trim();
    if (isHttpUrl(t)) return { url: t };
  }
  const stream = json.stream;
  if (stream && typeof stream === 'object' && !Array.isArray(stream)) {
    const su = (stream as Record<string, unknown>).url;
    if (typeof su === 'string') {
      const t = su.trim();
      if (isHttpUrl(t)) return { url: t };
    }
  }
  const sources = json.sources;
  if (Array.isArray(sources)) {
    for (const row of sources) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
      const r = row as Record<string, unknown>;
      const file = r.file ?? r.url;
      if (typeof file === 'string') {
        const t = file.trim();
        if (isHttpUrl(t)) return { url: t };
      }
    }
  }
  return null;
}

function mirunoSubtitlesToTracks(subtitles: unknown): VideoTrack[] {
  if (!Array.isArray(subtitles)) return [];
  const out: VideoTrack[] = [];
  for (const row of subtitles) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
    const r = row as Record<string, unknown>;
    const file = typeof r.file === 'string' ? r.file.trim() : '';
    if (!file || !isHttpUrl(file)) continue;
    const label = typeof r.label === 'string' && r.label.trim() ? r.label.trim() : 'Subtitle';
    const kind = typeof r.kind === 'string' && r.kind.trim() ? r.kind.trim() : 'captions';
    out.push({
      file,
      label,
      kind,
      default: r.default === true,
    });
  }
  return out;
}

/**
 * Лише dub: Miruno Native API (AniList id + episode).
 * Викликати лише коли в каталозі Animepahe для епізоду `hasDub !== true`.
 */
export async function tryResolveMirunoDubHls(params: {
  anilistId: number;
  episode: number;
  origin: string;
  probeCfg: WatchProbeConfig;
}): Promise<StreamingType | null> {
  const base = readMirunoApiBaseUrl();
  if (!base) return null;

  const { anilistId, episode, origin, probeCfg } = params;
  const epParam = Number.isFinite(episode) ? String(episode) : '';

  /**
   * `server=hd-1|hd-2` — лінія Miruno (Arc / Bee), як у їхньому `/api/stream`.
   * Поле `streams[].server` у JSON (Vidstream, VidCloud) — лише мітка CDN, не цей параметр.
   * Спочатку `hd-2`: частіше збігає з ручним тестом dub (Bee); далі fallback на `hd-1`.
   */
  for (const server of ['hd-2', 'hd-1'] as const) {
    const apiUrl = `${base}/api/stream?id=${anilistId}&ep=${encodeURIComponent(epParam)}&server=${server}&type=dub`;
    try {
      const res = await fetch(apiUrl, {
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });
      const text = await res.text();
      let json: Record<string, unknown> | null = null;
      try {
        json = text.trim() ? (JSON.parse(text) as Record<string, unknown>) : null;
      } catch {
        json = null;
      }
      if (!res.ok || !json || typeof json.error === 'string') continue;

      const pick = extractMirunoPrimaryStream(json);
      if (!pick) continue;

      const requestHeaders: Record<string, string> = {};
      if (pick.referer?.trim()) {
        requestHeaders.Referer = pick.referer.trim();
        try {
          requestHeaders.Origin = new URL(pick.referer).origin;
        } catch {
          /* ignore */
        }
      }

      const serverSuffix = pick.serverLabel ? ` · ${pick.serverLabel}` : '';
      const candidate: StreamingType = {
        id: 1,
        type: 'dub',
        link: { file: pick.url, type: 'hls' },
        tracks: mirunoSubtitlesToTracks(json.subtitles),
        server: `Miruno · ${server}${serverSuffix}`,
        request_headers:
          Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
      };

      const probe = await probeHlsStreamViaProxy(origin, candidate, probeCfg);
      if (!probe.ok) continue;
      if (
        isMirunoDubHlsManifestCheckEnabled() &&
        probe.masterPlaylistText &&
        !hlsMasterSuggestsDubLikeAudio(probe.masterPlaylistText)
      ) {
        continue;
      }
      return candidate;
    } catch {
      continue;
    }
  }

  return null;
}
