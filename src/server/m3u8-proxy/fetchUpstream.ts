import type { NextRequest } from 'next/server';

import {
  dropOriginHeader,
  mergeUpstreamHeaders,
  parseForwardHeaders,
  withRangeHeader,
} from './upstreamHeaders';

export function buildForwardHeaders(
  req: NextRequest,
  fetchUrl: string,
  headersJson: string,
): Record<string, string> {
  return withRangeHeader(
    req,
    fetchUrl,
    mergeUpstreamHeaders(parseForwardHeaders(headersJson)),
  );
}

export async function fetchUpstream(
  fetchUrl: string,
  forwardHeaders: Record<string, string>,
): Promise<Response> {
  let upstreamResponse = await fetch(fetchUrl, {
    redirect: 'follow',
    headers: forwardHeaders,
  });

  if (!upstreamResponse.ok && forwardHeaders.Origin) {
    const retryHeaders = dropOriginHeader(forwardHeaders);
    const retryRes = await fetch(fetchUrl, {
      redirect: 'follow',
      headers: retryHeaders,
    });
    if (retryRes.ok) upstreamResponse = retryRes;
  }

  return upstreamResponse;
}
