const HIKKA_API = 'https://api.hikka.io';

const BROWSER_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Referer: 'https://hikka.io/',
};

export async function hikkaIoFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  for (const [k, v] of Object.entries(BROWSER_HEADERS)) {
    if (!headers.has(k)) headers.set(k, v);
  }
  return fetch(url, { ...init, headers, cache: 'no-store' });
}

export function hikkaIoUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${HIKKA_API}${p}`;
}
