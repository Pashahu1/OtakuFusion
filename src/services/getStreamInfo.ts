/**
 * AnimeKai playback: ланцюжок на бекенді
 * 1) (опційно) GET /api/anime/anilist/<id> або /api/anime/mal/<mal_id> → ani_id
 * 2) GET /api/search?keyword=… → slug
 * 3) GET /api/anime/<slug> → ani_id (+ mal_id / anilist_id у форку)
 * 4) GET /api/episodes/<ani_id> → episodes[].token (ep_token)
 * 5) GET /api/servers/<ep_token> → servers.*[].link_id
 * 6) GET /api/source/<link_id> → цей модуль (HLS, skip, tracks, embed_url)
 */
import { ApiError } from '@/lib/errors/ApiError';
import { animekaiApi } from '@/lib/animekai-api';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { AnimeKaiSourceResponse } from '@/shared/types/AnimeKaiSourceTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { VideoTrack } from '@/shared/types/VideoTrackTypes';

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** У відповіді API skip.intro / skip.outro — зазвичай кортеж [start, end] у секундах. */
function segmentFromTuple(
  value: unknown
): { start: number; end: number } | undefined {
  if (!Array.isArray(value) || value.length < 2) return undefined;
  const start = asFiniteNumber(value[0]);
  const end = asFiniteNumber(value[1]);
  if (start == null || end == null || start < 0 || end <= start) return undefined;
  return { start, end };
}

function segmentFromObject(
  value: unknown
): { start: number; end: number } | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const o = value as Record<string, unknown>;
  const start = asFiniteNumber(o.start ?? o.from);
  const end = asFiniteNumber(o.end ?? o.to);
  if (start == null || end == null || start < 0 || end <= start) return undefined;
  return { start, end };
}

function introOutroFromSkip(skip: AnimeKaiSourceResponse['skip']): {
  intro: { start: number; end: number };
  outro: { start: number; end: number };
} {
  if (!skip || typeof skip !== 'object') {
    return {
      intro: { start: 0, end: 0 },
      outro: { start: 0, end: 0 },
    };
  }
  const s = skip as Record<string, unknown>;
  const intro =
    segmentFromTuple(s.intro) ??
    segmentFromObject(s.intro) ??
    segmentFromObject(s.op) ??
    { start: 0, end: 0 };
  const outro =
    segmentFromTuple(s.outro) ??
    segmentFromObject(s.outro) ??
    segmentFromObject(s.ed) ??
    { start: 0, end: 0 };
  return { intro, outro };
}

function refererFromEmbed(embedUrl: string | undefined): string | undefined {
  if (!embedUrl?.trim()) return undefined;
  try {
    const u = new URL(embedUrl);
    return `${u.origin}/`;
  } catch {
    return undefined;
  }
}

function firstPlayableFile(row: Record<string, unknown>): string | undefined {
  const keys = ['file', 'url', 'src', 'hls', 'link', 'source', 'm3u8'] as const;
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

function collectSourceRows(payload: AnimeKaiSourceResponse): Record<string, unknown>[] {
  const raw = payload.sources ?? (payload as { source?: unknown }).source;
  if (Array.isArray(raw)) {
    return raw.filter(
      (x): x is Record<string, unknown> => x != null && typeof x === 'object'
    );
  }
  if (raw && typeof raw === 'object' && Array.isArray((raw as { list?: unknown }).list)) {
    const list = (raw as { list: unknown[] }).list;
    return list.filter(
      (x): x is Record<string, unknown> => x != null && typeof x === 'object'
    );
  }
  return [];
}

function mapRootTracks(
  tracks: AnimeKaiSourceResponse['tracks'] | undefined
): VideoTrack[] {
  if (!Array.isArray(tracks)) return [];
  const out: VideoTrack[] = [];
  tracks.forEach((t, i) => {
    if (!t || typeof t !== 'object') return;
    const file =
      typeof t.file === 'string' && t.file.trim()
        ? t.file.trim()
        : typeof t.url === 'string' && t.url.trim()
          ? t.url.trim()
          : '';
    if (!file.trim()) return;
    const kindRaw = (typeof t.kind === 'string' ? t.kind : 'captions').toLowerCase();
    const kind =
      kindRaw === 'thumbnail' || kindRaw === 'thumbs' ? 'thumbnails' : kindRaw;
    const label =
      typeof t.label === 'string' && t.label.trim()
        ? t.label.trim()
        : typeof t.lang === 'string' && t.lang.trim()
          ? t.lang.trim()
          : kind;
    out.push({
      file,
      label,
      kind,
      default: t.default === true || i === 0,
    });
  });
  return out;
}

function sourcePayloadToStreamingData(
  payload: AnimeKaiSourceResponse,
  server: ServerInfo,
  type: string
): StreamingData {
  if (typeof payload.error === 'string' && payload.error.trim()) {
    throw new ApiError(payload.error.trim(), 502);
  }
  if (payload.success === false) {
    throw new ApiError(
      typeof payload.error === 'string' && payload.error.trim()
        ? payload.error.trim()
        : 'AnimeKai: source unavailable',
      502
    );
  }

  const rows = collectSourceRows(payload);
  const { intro, outro } = introOutroFromSkip(payload.skip);
  const embedReferer = refererFromEmbed(payload.embed_url);
  const rootTracks = mapRootTracks(payload.tracks);

  const streamingLink = rows
    .map((row, index) => {
      const file = firstPlayableFile(row);
      if (!file) return null;
      const linkType =
        typeof row.type === 'string' && row.type.trim()
          ? String(row.type).toLowerCase()
          : file.includes('.m3u8')
            ? 'hls'
            : 'mp4';
      return {
        id: index + 1,
        type: type === 'dub' ? ('dub' as const) : ('sub' as const),
        server: server.serverName,
        link: { file, type: linkType },
        iframe: embedReferer,
        tracks: index === 0 ? rootTracks : [],
        intro,
        outro,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  return {
    streamingLink,
    servers: [
      {
        type: server.type,
        data_id: server.data_id,
        server_id: server.server_id,
        server_name: server.serverName,
      },
    ],
  };
}

function isRetryableSourceHttpStatus(status: number): boolean {
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

/** Один повтор після короткої паузи — часто Fly/проксі дають тимчасовий 500. */
async function fetchSourcePayload(
  linkId: string,
  signal?: AbortSignal
): Promise<AnimeKaiSourceResponse> {
  const path = `/api/source/${encodeURIComponent(linkId)}`;
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await animekaiApi.get<AnimeKaiSourceResponse>(
        path,
        undefined,
        signal
      );
    } catch (e) {
      lastErr = e;
      const retry =
        attempt === 0 &&
        e instanceof ApiError &&
        isRetryableSourceHttpStatus(e.status) &&
        !signal?.aborted;
      if (!retry) throw e;
      await new Promise((r) => setTimeout(r, 500));
      if (signal?.aborted) throw e;
    }
  }
  throw lastErr;
}

export async function getStreamInfo(
  server: ServerInfo,
  type: string,
  signal?: AbortSignal
): Promise<StreamingData> {
  const linkId = server.link_id?.trim();
  if (!linkId) {
    throw new ApiError('Немає link_id для відтворення (AnimeKai).', 400);
  }

  const payload = await fetchSourcePayload(linkId, signal);

  return sourcePayloadToStreamingData(payload, server, type);
}
