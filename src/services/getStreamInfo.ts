import { apiUrl, type ApiResponse } from '@/lib/api';
import { ApiError } from '@/lib/errors/ApiError';
import { publicEnv } from '@/lib/env.public';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';

type StreamResults = StreamingData & { error?: string };

function getResultsError(results: unknown): string | null {
  if (!results || typeof results !== 'object') return null;
  const err = (results as { error?: unknown }).error;
  return typeof err === 'string' && err.trim() ? err.trim() : null;
}

function hasStreamingPayload(results: unknown): boolean {
  if (!results || typeof results !== 'object') return false;
  const sl = (results as { streamingLink?: unknown }).streamingLink;
  if (sl == null) return false;
  if (Array.isArray(sl)) return sl.length > 0;
  if (typeof sl === 'object') return true;
  return false;
}

/**
 * HiAnime / animeWatch парсять рядок як у README: `id=...?ep=...&server=...&type=...`
 * (другий `?` перед `ep`, не стандартний `&ep=`). Інакше часто `Invalid URL format`.
 */
function buildStreamQueryString(
  animeId: string,
  episodeId: string,
  server: string,
  type: string
): string {
  const enc = encodeURIComponent;
  return `id=${enc(animeId)}?ep=${enc(episodeId)}&server=${enc(server)}&type=${enc(type)}`;
}

async function fetchStreamPath(
  path: '/stream/fallback' | '/stream',
  query: string,
  signal?: AbortSignal
): Promise<StreamResults> {
  const data = await apiUrl.get<ApiResponse<StreamResults>>(
    `${path}?${query}`,
    undefined,
    signal
  );
  return data.results;
}

async function fetchStreamEndpoints(
  query: string,
  signal?: AbortSignal
): Promise<{ data: StreamingData } | { message: string }> {
  if (process.env.NODE_ENV === 'development') {
    const base = publicEnv.NEXT_PUBLIC_API_URL;
    console.debug('[getStreamInfo]', `${base}/stream/fallback?${query}`);
  }

  let results = await fetchStreamPath('/stream/fallback', query, signal);
  if (!getResultsError(results) && hasStreamingPayload(results)) {
    return { data: results as StreamingData };
  }

  if (signal?.aborted) {
    return { message: getResultsError(results) || 'Aborted' };
  }

  const second = await fetchStreamPath('/stream', query, signal);
  if (!getResultsError(second) && hasStreamingPayload(second)) {
    return { data: second as StreamingData };
  }

  return {
    message:
      getResultsError(second) ||
      getResultsError(results) ||
      'Stream unavailable',
  };
}

/**
 * Кандидати для query `server`. Локальний animeWatch часто приймає **serverName**
 * (як у робочому `server=VidSrc`); числові id інколи дають `Invalid URL format` —
 * тому спочатку ім’я, потім id.
 */
function serverQueryCandidates(server: ServerInfo): string[] {
  const out: string[] = [];
  const push = (v: string | number | undefined | null) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (s && !out.includes(s)) out.push(s);
  };
  push(server.serverName);
  push(server.server_id);
  push(server.data_id);
  return out;
}

/**
 * Див. [animeWatch README](https://github.com/Pashahu1/animeWatch#get-streaming-info): `server`
 * у query — часто **server_id** або **data_id** з `/servers`, інколи **serverName**.
 */
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

    const out = await fetchStreamEndpoints(query, signal);
    if ('data' in out) return out.data;
    lastMessage = out.message;
  }

  throw new ApiError(lastMessage, 502);
}
