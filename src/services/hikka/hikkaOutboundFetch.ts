const DEFAULT_FEATURES_BASE = 'https://api.hikka-features.pp.ua';

const BROWSER_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Referer: 'https://hikka.io/',
  Origin: 'https://hikka.io',
};

export class HikkaFeaturesForbiddenError extends Error {
  constructor(public readonly status: number) {
    super(`hikka_features_forbidden_${status}`);
    this.name = 'HikkaFeaturesForbiddenError';
  }
}

export function hikkaFeaturesBaseUrl(): string {
  const relay = process.env.HIKKA_FEATURES_RELAY_BASE?.trim();
  if (relay) return relay.replace(/\/+$/, '');
  const raw = process.env.HIKKA_FEATURES_API_BASE?.trim();
  return (raw || DEFAULT_FEATURES_BASE).replace(/\/+$/, '');
}

export async function hikkaOutboundFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  for (const [k, v] of Object.entries(BROWSER_HEADERS)) {
    if (!headers.has(k)) headers.set(k, v);
  }

  return fetch(url, {
    ...init,
    headers,
    cache: 'no-store',
  });
}

export async function fetchHikkaFeaturesJson<T>(path: string): Promise<T | null> {
  const base = hikkaFeaturesBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${p}`;
  const res = await hikkaOutboundFetch(url);
  if (res.status === 404) return null;
  if (res.status === 403 || res.status === 401) {
    throw new HikkaFeaturesForbiddenError(res.status);
  }
  if (!res.ok) {
    throw new Error(`hikka_features_${res.status}`);
  }
  const json = (await res.json()) as T;
  return json && typeof json === 'object' ? json : null;
}
