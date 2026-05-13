import 'server-only';

import { getAnilibriaApiBaseUrl } from './config';

export async function anilibriaFetchText(
  pathAndQuery: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; text: string }> {
  const base = getAnilibriaApiBaseUrl();
  const path = pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`;
  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      accept: 'application/json',
      ...(init?.headers as Record<string, string> | undefined),
    },
    signal: init?.signal,
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}
