/** Referer-only for upstream HLS/CDN — Origin often triggers 522/timeouts on some hosts. */
export function stripOriginFromHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!key.trim() || typeof value !== 'string' || !value.trim()) continue;
    if (key.toLowerCase() === 'origin') continue;
    out[key.trim()] = value.trim();
  }
  return out;
}
