import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

/**
 * Список серверів AnimeKai для ep_token через BFF (кеш на сервері).
 */
export async function getKaiServersFromBff(
  epToken: string | null | undefined,
  signal?: AbortSignal
): Promise<ServerInfo[]> {
  const token = epToken?.trim();
  if (!token) return [];

  const q = new URLSearchParams();
  q.set('token', token);

  const res = await fetch(`/api/kai/servers?${q.toString()}`, {
    method: 'GET',
    cache: 'no-store',
    signal,
    headers: { accept: 'application/json' },
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text.trim() ? JSON.parse(text) : null;
  } catch {
    throw new Error('kai_servers_invalid_json');
  }

  if (!res.ok) {
    const err =
      json && typeof json === 'object' && typeof (json as { error?: unknown }).error === 'string'
        ? (json as { error: string }).error
        : `kai_servers_${res.status}`;
    throw new Error(err);
  }

  if (!Array.isArray(json)) {
    throw new Error('kai_servers_invalid_shape');
  }

  return json as ServerInfo[];
}
