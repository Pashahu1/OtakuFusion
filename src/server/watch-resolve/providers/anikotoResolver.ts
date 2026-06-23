import { getAnikotoStreamCached } from '@/server/anikoto/streamCached';
import { normalizeAnikotoSkipSegment } from '@/lib/catalog/providers/anikoto/normalizeAnikotoSkipSegment';
import { isPlayableViaProxy, readWatchProbeConfig } from '@/server/watch-resolve/probe';
import type { AnikotoResolveParams, WatchResolveOutcome } from '@/server/watch-resolve/types';
import { watchResolveErrorOutcome } from '@/server/watch-resolve/outcome';
import type { StreamingType } from '@/shared/types/StreamingTypes';

const ANIKOTO_SERVERS = ['hd-2', 'hd-1'] as const;

async function probeAnikotoM3u8(
  origin: string,
  m3u8: string,
  referer: string,
  lang: 'sub' | 'dub',
): Promise<boolean> {
  const probeCfg = readWatchProbeConfig(lang);
  const requestHeaders: Record<string, string> = {};
  if (referer.trim()) requestHeaders.Referer = referer.trim();

  const candidate: StreamingType = {
    id: 1,
    type: lang,
    link: { file: m3u8, type: 'hls' },
    tracks: [],
    server: 'Anikoto',
    request_headers: requestHeaders,
  };

  return isPlayableViaProxy(origin, candidate, probeCfg);
}

export async function computeAnikotoWatchResolveOutcome(
  params: AnikotoResolveParams,
): Promise<WatchResolveOutcome> {
  const { startedAt, episode, origin, anikotoSlug, lang } = params;

  try {
    async function fetchPlayableStream(type: 'sub' | 'dub') {
      let last: Awaited<ReturnType<typeof getAnikotoStreamCached>> | null = null;

      for (const server of ANIKOTO_SERVERS) {
        const attempt = await getAnikotoStreamCached({
          id: anikotoSlug,
          ep: String(episode),
          server,
          type,
        });
        last = attempt;

        const m3u8 = attempt.success ? attempt.data?.m3u8?.trim() : '';
        if (!m3u8) continue;

        const referer = attempt.data?.referer?.trim() ?? '';
        const playable = await probeAnikotoM3u8(origin, m3u8, referer, type);
        if (playable) {
          return { attempt, type, m3u8, referer };
        }
      }

      return { attempt: last, type, m3u8: null as string | null, referer: '' };
    }

    let resolvedLang = lang;
    let picked = await fetchPlayableStream(lang);

    if (!picked.m3u8 && lang === 'sub') {
      const dubPicked = await fetchPlayableStream('dub');
      if (dubPicked.m3u8) {
        picked = dubPicked;
        resolvedLang = 'dub';
      }
    }

    if (!picked.m3u8) {
      const hadM3u8 = picked.attempt?.success && picked.attempt.data?.m3u8?.trim();
      if (hadM3u8) {
        return {
          status: 404,
          body: {
            success: false,
            error: 'no_working_source',
            reason: 'anikoto_stream_probe_failed',
          },
        };
      }

      const reason = lang === 'dub' ? 'dub_not_available' : 'sub_not_available';
      return {
        status: 404,
        body: {
          success: false,
          error: 'no_working_source',
          reason: `anikoto_stream_empty|${reason}`,
        },
      };
    }

    const payload = picked.attempt!;
    const requestHeaders: Record<string, string> = {};
    if (picked.referer) requestHeaders.Referer = picked.referer;

    const tracks = (payload.data?.subtitles ?? [])
      .filter((t) => typeof t.file === 'string' && t.file.trim())
      .map((t) => ({
        file: t.file.trim(),
        kind: t.kind ?? 'captions',
        label: t.label ?? 'English',
        default: t.default === true,
      }));

    return {
      status: 200,
      body: {
        success: true,
        stream_provider: 'anikoto',
        resolved_anime: {
          ani_id: anikotoSlug,
          slug: anikotoSlug,
          status: 'verified',
          resolved_by: 'cache',
        },
        episode: {
          number: episode,
          ep_token: String(episode),
          hasSub: resolvedLang !== 'dub',
          hasDub: resolvedLang === 'dub',
        },
        stream: {
          url: picked.m3u8,
          format: 'hls',
          lang: resolvedLang,
          server: 'Anikoto',
          request_headers: requestHeaders,
          tracks,
        },
        segments: {
          intro: normalizeAnikotoSkipSegment(payload.data?.intro),
          outro: normalizeAnikotoSkipSegment(payload.data?.outro),
        },
        fallback: {
          applied: resolvedLang !== lang,
          from: lang,
          to: resolvedLang !== lang ? resolvedLang : null,
          reason: resolvedLang !== lang ? 'anikoto_sub_empty_used_dub' : null,
        },
        debug: {
          latency_ms: Date.now() - startedAt,
          requested_lang: lang,
        },
      },
    };
  } catch (error) {
    return watchResolveErrorOutcome(error);
  }
}
