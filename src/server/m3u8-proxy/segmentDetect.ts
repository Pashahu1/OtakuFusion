/** Anikoto / sugevideo CDN disguises HLS segments as static assets. */
const DISGUISED_SEGMENT_PATH = /\/seg-\d+[-/]/i;

const BINARY_SEGMENT_EXT = /\.(ts|m4s|aac|mp4|webm|mkv)(\?|$)/i;
const DISGUISED_SEGMENT_EXT = /\.(jpg|jpeg|png|webp|ico|html|js|css|txt)(\?|$)/i;
const WEBVTT_EXT = /\.(vtt|srt)(\?|$)/i;

export function looksLikeHlsSegmentUrl(url: string): boolean {
  const raw = url.trim();
  if (!raw) return false;
  if (BINARY_SEGMENT_EXT.test(raw)) return true;
  if (DISGUISED_SEGMENT_PATH.test(raw) && DISGUISED_SEGMENT_EXT.test(raw)) return true;
  return false;
}

export function looksLikeWebVttUrl(url: string): boolean {
  const raw = url.trim();
  if (!raw) return false;
  return WEBVTT_EXT.test(raw);
}

export function looksLikePassthroughMediaUrl(url: string): boolean {
  return looksLikeHlsSegmentUrl(url) || looksLikeWebVttUrl(url);
}
