import type { NextRequest } from 'next/server';
import { decodeStreamUrlForInspection } from '@/lib/streamMediaType';

const DEFAULT_UPSTREAM_FETCH_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};

export function parseForwardHeaders(headersParam: string | null): Record<string, string> {
  const raw = (headersParam ?? '{}').trim();
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw) as unknown;
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (!k.trim()) continue;
      if (typeof v === 'string' && v.length > 0) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function mergeUpstreamHeaders(forwardHeaders: Record<string, string>): Record<string, string> {
  return { ...DEFAULT_UPSTREAM_FETCH_HEADERS, ...forwardHeaders };
}

export function dropOriginHeader(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === 'origin') continue;
    out[key] = value;
  }
  return out;
}

function targetUrlLooksLikePlaylistOrProxy(targetUrl: string): boolean {
  const u = targetUrl.toLowerCase();
  if (u.includes('.m3u8') || u.includes('mpegurl')) return true;
  if (u.includes('proxy.crysoline') || u.includes('crysoline.moe/proxy')) return true;
  const inner = decodeStreamUrlForInspection(targetUrl).toLowerCase();
  if (
    inner.includes('rev.anikage') ||
    inner.includes('anikage.cc') ||
    inner.includes('24stream.xyz')
  ) {
    return !/\.(ts|m4s|aac|mp4|webm|mkv)(\?|$)/i.test(inner);
  }
  return false;
}

function shouldForwardClientRange(targetUrl: string, rangeHeader: string | null): boolean {
  const range = rangeHeader?.trim();
  if (!range) return false;
  const normalized = range.toLowerCase();
  if (normalized === 'bytes=0-' || normalized === 'bytes=0') return false;
  if (targetUrlLooksLikePlaylistOrProxy(targetUrl)) return false;
  if (/\.(ts|m4s|aac|mp4|webm|mkv|vtt|srt)(\?|$)/i.test(targetUrl)) return true;
  return /bytes=\d+-\d+/.test(normalized);
}

export function withRangeHeader(
  req: NextRequest,
  targetUrl: string,
  headers: Record<string, string>,
): Record<string, string> {
  const range = req.headers.get('range')?.trim() ?? null;
  if (!shouldForwardClientRange(targetUrl, range)) return headers;
  return { ...headers, Range: range! };
}
