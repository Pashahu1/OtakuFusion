import type { NextRequest } from 'next/server';

import { buildForwardHeaders, fetchUpstream } from '@/server/m3u8-proxy/fetchUpstream';
import {
  bufferedResponse,
  passthroughResponse,
  shouldStreamPassthrough,
  tryRewritePlaylistResponse,
  upstreamFetchUrl,
} from '@/server/m3u8-proxy/m3u8Rewrite';
import { isTargetUrlAllowed } from '@/server/m3u8-proxy/targetUrlPolicy';

/** Local proxy for HLS (.m3u8 + segments) — no dependency on external services like m3u8proxy.fly.dev. */
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam) {
    return Response.json({ error: 'Missing url query.' }, { status: 400 });
  }

  const targetUrl = urlParam.trim();
  const fetchUrl = upstreamFetchUrl(targetUrl);

  if (!isTargetUrlAllowed(targetUrl) || !isTargetUrlAllowed(fetchUrl)) {
    return Response.json({ error: 'Target URL not allowed.' }, { status: 400 });
  }

  const headersJson = req.nextUrl.searchParams.get('headers') ?? '{}';
  const forwardHeaders = buildForwardHeaders(req, fetchUrl, headersJson);

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetchUpstream(fetchUrl, forwardHeaders);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'fetch failed';
    return Response.json({ error: message }, { status: 502 });
  }

  const finalUrl = upstreamResponse.url || fetchUrl;
  const contentTypeRaw =
    upstreamResponse.headers.get('content-type') ?? 'application/octet-stream';

  const contentLength = upstreamResponse.headers.get('content-length');
  const parsedLen = contentLength ? Number(contentLength) : NaN;

  if (
    shouldStreamPassthrough(
      fetchUrl,
      contentTypeRaw,
      parsedLen,
      upstreamResponse.ok,
      Boolean(upstreamResponse.body),
    )
  ) {
    return passthroughResponse(upstreamResponse, contentTypeRaw);
  }

  const buf = await upstreamResponse.arrayBuffer();

  if (!upstreamResponse.ok) {
    return new Response(buf, {
      status: upstreamResponse.status,
      headers: { 'Content-Type': contentTypeRaw },
    });
  }

  const rewritten = tryRewritePlaylistResponse(
    req,
    buf,
    fetchUrl,
    finalUrl,
    headersJson,
  );
  if (rewritten) return rewritten;

  return bufferedResponse(buf, upstreamResponse, contentTypeRaw);
}
