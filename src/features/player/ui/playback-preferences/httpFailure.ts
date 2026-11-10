const RETRYABLE_CLIENT_HTTP = new Set([408, 425, 429]);

function readHttpCode(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null;
  const code = (data as { response?: { code?: unknown } }).response?.code;
  return typeof code === 'number' ? code : null;
}

/** Transient 4xx — backoff and retry; do not kill the player. */
export function isRetryableHttpFailure(data: unknown): boolean {
  const code = readHttpCode(data);
  return code != null && RETRYABLE_CLIENT_HTTP.has(code);
}

/** Permanent HTTP 4xx from edge/CDN — do not recover via Hls.startLoad. */
export function isHardHttpFailure(data: unknown): boolean {
  const code = readHttpCode(data);
  if (code == null || code < 400 || code >= 500) return false;
  return !RETRYABLE_CLIENT_HTTP.has(code);
}
