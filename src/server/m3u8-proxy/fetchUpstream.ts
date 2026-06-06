import type { NextRequest } from 'next/server';

import {
  dropOriginHeader,
  mergeUpstreamHeaders,
  parseForwardHeaders,
  withRangeHeader,
} from './upstreamHeaders';

const UPSTREAM_FETCH_TIMEOUT_MS = 28_000;

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
  return fetch(fetchUrl, {
    redirect: 'follow',
    headers: dropOriginHeader(forwardHeaders),
    signal: AbortSignal.timeout(UPSTREAM_FETCH_TIMEOUT_MS),
  });
}
