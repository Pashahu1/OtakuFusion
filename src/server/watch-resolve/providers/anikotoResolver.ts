import { anikotoDubPlaylistIsDistinct } from '@/lib/catalog/providers/anikoto/mapAnikotoStream';
import type { AnikotoMappedStream } from '@/lib/catalog/providers/anikoto/anikotoTypes';
import { fetchAnikotoStream } from '@/server/anikoto/client';
import { ANIKOTO_STREAM_SERVERS } from '@/server/anikoto/config';
import {
  matchAnikotoCatalogCached,
  type AnikotoMatchQuery,
} from '@/server/anikoto/matchCatalog';
import { watchResolveErrorOutcome } from '@/server/watch-resolve/outcome';
import { isPlayableViaProxy, readWatchProbeConfig } from '@/server/watch-resolve/probe';
import type { WatchResolveOutcome } from '@/server/watch-resolve/types';
import type { StreamingType } from '@/shared/types/StreamingTypes';

export interface AnikotoResolveParams {
  startedAt: number;
  episode: number;
  origin: string;
  audio: 'ja' | 'en';
  match: AnikotoMatchQuery;
}

function unavailableReason(audio: 'ja' | 'en'): string {
  return audio === 'en' ? 'anikoto_dub_not_available' : 'anikoto_sub_not_available';
}

function toCandidate(
  mapped: AnikotoMappedStream,
  server: string,
  streamType: 'sub' | 'dub',
): StreamingType {
  return {
    id: 1,
    type: streamType,
    link: { file: mapped.url, type: 'hls' },
    tracks: mapped.tracks.map((track) => ({
      file: track.file,
      label: track.label,
      kind: track.kind,
      default: track.default === true,
    })),
    server: server.toUpperCase(),
    iframe: mapped.referer,
    request_headers: { Referer: mapped.referer },
  };
}

export async function computeAnikotoWatchResolveOutcome(
  params: AnikotoResolveParams,
): Promise<WatchResolveOutcome> {
  const { startedAt, episode, origin, audio, match } = params;
  const streamType = audio === 'en' ? 'dub' : 'sub';
  const audioLabel = audio === 'en' ? 'English' : 'Japanese';

  try {
    const resolved = await matchAnikotoCatalogCached(match);
    if (!resolved) {
      return {
        status: 404,
        body: { success: false, error: 'anikoto_catalog_not_found' },
      };
    }
    if (audio === 'ja' && !resolved.hasJapanese) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'no_working_source',
          reason: unavailableReason(audio),
        },
      };
    }
    if (audio === 'en' && !resolved.hasEnglish) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'no_working_source',
          reason: unavailableReason(audio),
        },
      };
    }

    const probeCfg = readWatchProbeConfig(streamType);

    for (const server of ANIKOTO_STREAM_SERVERS) {
      const mapped = await fetchAnikotoStream({
        id: resolved.id,
        episode,
        server,
        type: streamType,
      });
      if (!mapped) continue;
      if (audio === 'en') {
        const japanese = await fetchAnikotoStream({
          id: resolved.id,
          episode,
          server,
          type: 'sub',
        });
        if (!anikotoDubPlaylistIsDistinct(japanese?.url ?? null, mapped.url)) continue;
      }

      const candidate = toCandidate(mapped, server, streamType);
      // Megaplay often rejects the server-side probe and still plays in the browser
      // once the playlist is fetched with the provider Referer. One probe is enough.
      const playable = await isPlayableViaProxy(origin, candidate, probeCfg);

      return {
        status: 200,
        body: {
          success: true,
          resolved_anime: {
            ani_id: resolved.id,
            slug: resolved.id,
            status: 'verified',
            resolved_by: 'fuzzy_last_resort',
          },
          episode: {
            number: episode,
            ep_token: String(episode),
            hasSub: audio === 'ja',
            hasDub: audio === 'en',
          },
          stream: {
            url: candidate.link.file,
            format: 'hls',
            lang: streamType,
            server: audioLabel,
            request_headers: candidate.request_headers,
            tracks: candidate.tracks,
          },
          segments: {
            intro: mapped.intro,
            outro: mapped.outro,
          },
          fallback: {
            applied: false,
            from: null,
            to: null,
            reason: null,
          },
          debug: {
            latency_ms: Date.now() - startedAt,
            requested_lang: streamType,
            playback_audio: audio,
            anikoto_server: candidate.server,
            probe_ok: playable,
          },
        },
      };
    }

    return {
      status: 404,
      body: {
        success: false,
        error: 'no_working_source',
        reason: unavailableReason(audio),
      },
    };
  } catch (error) {
    return watchResolveErrorOutcome(error);
  }
}
