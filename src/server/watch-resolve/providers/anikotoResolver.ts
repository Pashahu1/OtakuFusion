import { getAnikotoStreamCached } from '@/server/anikoto/streamCached';
import { normalizeAnikotoSkipSegment } from '@/lib/catalog/providers/anikoto/normalizeAnikotoSkipSegment';
import type { AnikotoResolveParams, WatchResolveOutcome } from '@/server/watch-resolve/types';
import { watchResolveErrorOutcome } from '@/server/watch-resolve/outcome';

export async function computeAnikotoWatchResolveOutcome(
  params: AnikotoResolveParams,
): Promise<WatchResolveOutcome> {
  const { startedAt, episode, anikotoSlug, lang } = params;

  try {
    const servers = ['hd-2', 'hd-1'] as const;
    let payload: Awaited<ReturnType<typeof getAnikotoStreamCached>> | null = null;

    for (const server of servers) {
      const attempt = await getAnikotoStreamCached({
        id: anikotoSlug,
        ep: String(episode),
        server,
        type: lang,
      });
      if (attempt.success && attempt.data?.m3u8?.trim()) {
        payload = attempt;
        break;
      }
      payload = attempt;
    }

    if (!payload?.success || !payload.data?.m3u8?.trim()) {
      const reason =
        lang === 'dub' ? 'dub_not_available' : 'sub_not_available';
      return {
        status: 404,
        body: {
          success: false,
          error: 'no_working_source',
          reason: `anikoto_stream_empty|${reason}`,
        },
      };
    }

    const m3u8 = payload.data.m3u8.trim();
    const referer = payload.data.referer?.trim() ?? '';
    const requestHeaders: Record<string, string> = {};
    if (referer) requestHeaders.Referer = referer;

    const tracks = (payload.data.subtitles ?? [])
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
          hasSub: lang !== 'dub',
          hasDub: lang === 'dub',
        },
        stream: {
          url: m3u8,
          format: 'hls',
          lang,
          server: 'Anikoto',
          request_headers: requestHeaders,
          tracks,
        },
        segments: {
          intro: normalizeAnikotoSkipSegment(payload.data.intro),
          outro: normalizeAnikotoSkipSegment(payload.data.outro),
        },
        fallback: {
          applied: false,
          from: null,
          to: null,
          reason: null,
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
