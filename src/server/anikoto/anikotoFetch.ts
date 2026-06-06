import { readAnikotoFetchTimeoutMs } from '@/server/anikoto/config';

function mergeAbortSignals(
  outer?: AbortSignal,
  timeoutMs?: number
): AbortSignal | undefined {
  if (!timeoutMs || !Number.isFinite(timeoutMs) || timeoutMs <= 0) return outer;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  if (!outer) return timeoutSignal;
  return AbortSignal.any([outer, timeoutSignal]);
}

export async function anikotoGetJson<T>(
  url: URL,
  label: string,
  signal?: AbortSignal
): Promise<T> {
  const merged = mergeAbortSignals(signal, readAnikotoFetchTimeoutMs());
  const res = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: merged,
    cache: 'no-store',
  });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`${label}_http_${res.status}:${text.slice(0, 220)}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${label}_invalid_json`);
  }
}
