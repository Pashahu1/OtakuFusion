import type { TvdbLoginResponse } from './tvdbTypes';
import { TVDB_API } from './tvdbTypes';

let cachedToken: { value: string; until: number } | null = null;

export function getTvdbApiKey(): string | null {
  const key = process.env.TVDB_API_KEY?.trim();
  return key || null;
}

export async function tvdbLogin(apiKey: string): Promise<string | null> {
  if (cachedToken && Date.now() < cachedToken.until) {
    return cachedToken.value;
  }

  try {
    const res = await fetch(`${TVDB_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey: apiKey }),
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const json = (await res.json()) as TvdbLoginResponse;
    const token = json.data?.token?.trim();
    if (!token) return null;

    cachedToken = { value: token, until: Date.now() + 23 * 60 * 60 * 1000 };
    return token;
  } catch {
    return null;
  }
}
