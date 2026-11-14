import { ANIKOTO_STREAM_SERVERS, readAnikotoBrowserApiBase } from '@/lib/catalog/providers/anikoto/anikotoApiBase';
import { mapAnikotoStreamPayload } from '@/lib/catalog/providers/anikoto/mapAnikotoStream';
import { pickAnikotoPlaybackAttempt } from '@/lib/catalog/providers/anikoto/pickAnikotoPlayback';
import type { AnikotoMappedStream } from '@/lib/catalog/providers/anikoto/anikotoTypes';

export interface AnikotoClientStreamRequest {
  id: string;
  episode: number;
  type: 'sub' | 'dub';
  servers?: string[];
}

export interface AnikotoClientPlayback {
  stream: {
    url: string;
    format: 'hls';
    lang: 'sub' | 'dub';
    server: string;
    request_headers: { Referer: string };
    tracks: Array<{ file: string; kind?: string; label?: string; default?: boolean }>;
  };
  segments: {
    intro: { start: number; end: number } | null;
    outro: { start: number; end: number } | null;
  };
}

function unavailableReason(type: 'sub' | 'dub'): string {
  return type === 'dub' ? 'anikoto_dub_not_available' : 'anikoto_sub_not_available';
}

async function fetchMappedStream(
  id: string,
  episode: number,
  server: string,
  type: 'sub' | 'dub',
  signal?: AbortSignal,
): Promise<AnikotoMappedStream | null> {
  const params = new URLSearchParams({
    id,
    ep: String(episode),
    server,
    type,
  });
  const response = await fetch(`${readAnikotoBrowserApiBase()}/api/stream?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
    signal,
    headers: { accept: 'application/json' },
  });
  if (!response.ok) return null;
  return mapAnikotoStreamPayload(await response.json());
}

export async function anikotoEnglishPlaylistIsDistinct(
  id: string,
  signal?: AbortSignal,
): Promise<boolean | null> {
  const server = ANIKOTO_STREAM_SERVERS[0];
  if (!server) return null;
  const [sub, dub] = await Promise.all([
    fetchMappedStream(id, 1, server, 'sub', signal),
    fetchMappedStream(id, 1, server, 'dub', signal),
  ]);
  if (!sub?.url || !dub?.url) return null;
  return pickAnikotoPlaybackAttempt([{ server, sub, dub }], 'dub') != null;
}

export async function completeAnikotoClientStream(
  request: AnikotoClientStreamRequest,
  signal?: AbortSignal,
): Promise<AnikotoClientPlayback> {
  const id = request.id.trim();
  const episode = Math.floor(request.episode);
  const type = request.type === 'dub' ? 'dub' : 'sub';
  const servers = (request.servers?.length ? request.servers : [...ANIKOTO_STREAM_SERVERS]).filter(
    (server) => server.trim().length > 0,
  );

  if (!id || episode <= 0) {
    throw new Error(`no_working_source|${unavailableReason(type)}`);
  }

  for (const server of servers) {
    const sub = await fetchMappedStream(id, episode, server, 'sub', signal);
    if (type === 'sub') {
      if (!sub) continue;
      return toPlayback(sub, server, type);
    }
    const dub = await fetchMappedStream(id, episode, server, 'dub', signal);
    const picked = pickAnikotoPlaybackAttempt([{ server, sub, dub }], 'dub');
    if (!picked) continue;
    return toPlayback(picked.mapped, server, type);
  }

  throw new Error(`no_working_source|${unavailableReason(type)}`);
}

function toPlayback(
  mapped: AnikotoMappedStream,
  server: string,
  type: 'sub' | 'dub',
): AnikotoClientPlayback {
  return {
    stream: {
      url: mapped.url,
      format: 'hls',
      lang: type,
      server: type === 'dub' ? 'English' : 'Japanese',
      request_headers: { Referer: mapped.referer },
      tracks: mapped.tracks.map((track) => ({
        file: track.file,
        label: track.label,
        kind: track.kind,
        default: track.default === true,
      })),
    },
    segments: {
      intro: mapped.intro,
      outro: mapped.outro,
    },
  };
}
