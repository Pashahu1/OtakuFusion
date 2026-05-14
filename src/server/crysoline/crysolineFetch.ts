import { getCrysolineApiKey } from '@/server/crysoline/config';

function authHeaders(): Record<string, string> {
  return {
    accept: 'application/json',
    'x-api-key': getCrysolineApiKey(),
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Пауза до `resetTime` з тіла 429 Crysoline + невеликий буфер. */
function parse429WaitMs(bodyText: string): number {
  try {
    const j = JSON.parse(bodyText) as { resetTime?: string };
    if (typeof j.resetTime !== 'string') return 6000;
    const t = new Date(j.resetTime).getTime();
    if (!Number.isFinite(t)) return 6000;
    return clamp(t - Date.now() + 750, 2000, 90_000);
  } catch {
    return 6000;
  }
}

function sleepMs(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
      return;
    }
    const id = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(id);
      reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * GET до Crysoline з **одним** повтором після 429 (чекаємо до `resetTime` або дефолт).
 */
export async function crysolineGetJson<T>(
  url: URL,
  label: string,
  signal?: AbortSignal
): Promise<T> {
  let res = await fetch(url, { headers: authHeaders(), signal });
  let text = await res.text();

  if (res.status === 429) {
    const wait = parse429WaitMs(text);
    try {
      await sleepMs(wait, signal);
    } catch {
      throw new Error(`${label}_http_429:${text.slice(0, 220)}`);
    }
    res = await fetch(url, { headers: authHeaders(), signal });
    text = await res.text();
  }

  if (!res.ok) {
    throw new Error(`${label}_http_${res.status}:${text.slice(0, 220)}`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${label}_invalid_json`);
  }
}
