/** HTTP 4xx from edge/CDN — do not recover via Hls.startLoad. */
export function isHardHttpFailure(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as { response?: { code?: unknown } };
  const code = typeof d.response?.code === 'number' ? d.response.code : null;
  return code != null && code >= 400 && code < 500;
}
