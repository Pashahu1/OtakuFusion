export function getAnikotoApiBaseUrl(): string {
  const raw = process.env.ANIKOTO_API_BASE?.trim();
  if (!raw) {
    throw new Error('ANIKOTO_API_BASE is not configured');
  }
  return raw.replace(/\/+$/, '');
}

export function readAnikotoFetchTimeoutMs(): number {
  const raw = Number(process.env.ANIKOTO_FETCH_TIMEOUT_MS);
  if (Number.isFinite(raw) && raw >= 5000 && raw <= 120_000) {
    return Math.floor(raw);
  }
  return 28_000;
}

export const ANIKOTO_STREAM_CACHE_SECONDS = 600;
