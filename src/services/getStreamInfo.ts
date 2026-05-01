import { ApiError } from '@/lib/errors/ApiError';
import { publicEnv } from '@/lib/env.public';
import { videoApiUrl } from '@/lib/video-api';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';

interface MoruroStreamItem {
  url?: string;
  file?: string;
  src?: string;
  hls?: string;
  playlist?: string;
  type?: string;
  referer?: string;
  intro?: { start?: number; end?: number };
  outro?: { start?: number; end?: number };
  captions?: Array<{ lang?: string; url?: string }>;
  subtitles?: Array<{ lang?: string; url?: string }>;
}

interface MoruroStreamResponse {
  streams?: MoruroStreamItem[];
  error?: string;
  results?: {
    streams?: MoruroStreamItem[];
    error?: string;
  };
}

function getResultsError(results: unknown): string | null {
  if (!results || typeof results !== 'object') return null;
  const err = (results as { error?: unknown }).error;
  return typeof err === 'string' && err.trim() ? err.trim() : null;
}

function hasStreamingPayload(results: MoruroStreamResponse): boolean {
  const streams = Array.isArray(results.streams)
    ? results.streams
    : Array.isArray(results.results?.streams)
      ? results.results.streams
      : [];
  return streams.length > 0;
}

function buildStreamQueryString(
  animeId: string,
  episodeId: string,
  server: string,
  type: string
): string {
  const enc = encodeURIComponent;
  return `id=${enc(animeId)}&ep=${enc(episodeId)}&server=${enc(server)}&type=${enc(type)}`;
}

async function fetchStreamPath(
  query: string,
  signal?: AbortSignal
): Promise<MoruroStreamResponse> {
  return videoApiUrl.get<MoruroStreamResponse>(`/api/stream?${query}`, 60, signal);
}

function toStreamingData(
  payload: MoruroStreamResponse,
  server: ServerInfo,
  type: string
): StreamingData {
  const streams = Array.isArray(payload.streams)
    ? payload.streams
    : Array.isArray(payload.results?.streams)
      ? payload.results.streams
      : [];
  return {
    streamingLink: streams
      .filter((item) =>
        Boolean(item.url || item.file || item.src || item.hls || item.playlist)
      )
      .map((item, index) => {
        const subtitles = item.subtitles ?? item.captions ?? [];
        const file =
          item.url || item.file || item.src || item.hls || item.playlist || '';
        const referer = item.referer?.trim();
        return {
          id: index + 1,
          type: type === 'dub' ? 'dub' : 'sub',
          server: server.serverName,
          link: {
            file,
            type: item.type ?? 'hls',
          },
          iframe: referer ? `${referer.replace(/\/+$/, '')}/` : undefined,
          tracks: subtitles
            .filter((track) => Boolean(track.url))
            .map((track, trackIndex) => ({
              id: trackIndex + 1,
              kind: 'captions',
              default: trackIndex === 0,
              file: track.url ?? '',
              label: track.lang ?? `Subtitle ${trackIndex + 1}`,
            })),
          intro: {
            start: item.intro?.start ?? 0,
            end: item.intro?.end ?? 0,
          },
          outro: {
            start: item.outro?.start ?? 0,
            end: item.outro?.end ?? 0,
          },
        };
      }),
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

async function fetchStreamEndpoints(
  server: ServerInfo,
  type: string,
  query: string,
  signal?: AbortSignal
): Promise<{ data: StreamingData } | { message: string }> {
  if (process.env.NODE_ENV === 'development') {
    const base = publicEnv.NEXT_PUBLIC_STREAM_API_URL || publicEnv.NEXT_PUBLIC_API_URL;
    console.debug('[getStreamInfo]', `${base}/api/stream?${query}`);
  }

  const results = await fetchStreamPath(query, signal);
  if (!getResultsError(results) && hasStreamingPayload(results)) {
    return { data: toStreamingData(results, server, type) };
  }

  return {
    message: getResultsError(results) || 'Stream unavailable',
  };
}

function serverQueryCandidates(server: ServerInfo): string[] {
  const out: string[] = [];
  const normalizedServerName = server.serverName.trim().toLowerCase();
  const fromName =
    normalizedServerName === 'hd-1' || normalizedServerName === 'hd-2'
      ? normalizedServerName
      : normalizedServerName.includes('hd-1')
        ? 'hd-1'
        : normalizedServerName.includes('hd-2')
          ? 'hd-2'
          : null;

  if (fromName) out.push(fromName);
  if (server.server_id === 1) out.push('hd-1');
  if (server.server_id === 2) out.push('hd-2');

  const push = (v: string | number | undefined | null) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (s && !out.includes(s)) out.push(s);
  };

  // Fallbacks for non-standard backends only.
  push(normalizedServerName);
  push(server.serverName);
  push(server.server_id);
  return out;
}

export async function getStreamInfo(
  animeId: string,
  episodeId: string,
  server: ServerInfo,
  type: string,
  signal?: AbortSignal
): Promise<StreamingData> {
  const attempts = serverQueryCandidates(server);
  if (attempts.length === 0) {
    throw new ApiError('No server identifier', 400);
  }

  let lastMessage = 'Stream unavailable';

  for (const serverValue of attempts) {
    if (signal?.aborted) throw new ApiError('Aborted', 499);
    const query = buildStreamQueryString(
      animeId,
      episodeId,
      serverValue,
      type
    );

    const out = await fetchStreamEndpoints(server, type, query, signal);
    if ('data' in out) return out.data;
    lastMessage = out.message;
  }

  throw new ApiError(lastMessage, 502);
}
