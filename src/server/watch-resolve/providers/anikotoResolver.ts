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

    async function fetchStream(type: 'sub' | 'dub') {
      let last: Awaited<ReturnType<typeof getAnikotoStreamCached>> | null = null;
      for (const server of servers) {
        const attempt = await getAnikotoStreamCached({
          id: anikotoSlug,
          ep: String(episode),
          server,
          type,
        });
        if (attempt.success && attempt.data?.m3u8?.trim()) {
          return attempt;
        }
        last = attempt;
      }
      return last;
    }

    let resolvedLang = lang;
    let payload = await fetchStream(lang);

    if ((!payload?.success || !payload.data?.m3u8?.trim()) && lang === 'sub') {
      const dubPayload = await fetchStream('dub');
      if (dubPayload?.success && dubPayload.data?.m3u8?.trim()) {
        payload = dubPayload;
        resolvedLang = 'dub';
      }
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
          hasSub: resolvedLang !== 'dub',
          hasDub: resolvedLang === 'dub',
        },
        stream: {
          url: m3u8,
          format: 'hls',
          lang: resolvedLang,
          server: 'Anikoto',
          request_headers: requestHeaders,
          tracks,
        },
        segments: {
          intro: normalizeAnikotoSkipSegment(payload.data.intro),
          outro: normalizeAnikotoSkipSegment(payload.data.outro),
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
