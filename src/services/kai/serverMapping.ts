import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

export interface KaiServerEntry {
  name?: string;
  server_id?: string;
  episode_id?: string;
  link_id?: string;
}

export interface KaiServersPayload {
  success?: boolean;
  servers?: Record<string, unknown>;
  error?: string;
}

function formatServerLabel(groupKey: string, name: string): string {
  const g = groupKey.toLowerCase();
  const prefix = g === 'dub' ? 'Dub' : g === 'softsub' ? 'Softsub' : 'Sub';
  return `${prefix} · ${name}`;
}

function pushServerGroup(
  out: ServerInfo[],
  groupKey: string,
  playbackType: 'sub' | 'dub',
  list: unknown,
  nextId: { n: number }
): void {
  if (!Array.isArray(list)) return;
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const e = raw as KaiServerEntry;
    const linkId = e.link_id?.trim();
    if (!linkId) continue;
    const sidRaw = e.server_id?.trim();
    const serverNum = Number(sidRaw);
    const server_id = Number.isFinite(serverNum) ? serverNum : nextId.n;
    const name = e.name?.trim() || `Server ${server_id}`;
    out.push({
      type: playbackType,
      data_id: nextId.n++,
      server_id,
      serverName: formatServerLabel(groupKey, name),
      link_id: linkId,
    });
  }
}

export function mapKaiServersPayloadToServerInfo(data: KaiServersPayload): ServerInfo[] {
  if (typeof data.error === 'string' && data.error.trim()) {
    throw new Error(data.error.trim());
  }

  const serversObj = data.servers;
  if (!serversObj || typeof serversObj !== 'object') return [];

  const out: ServerInfo[] = [];
  const nextId = { n: 1 };

  pushServerGroup(out, 'sub', 'sub', serversObj.sub, nextId);
  pushServerGroup(out, 'softsub', 'sub', serversObj.softsub, nextId);
  pushServerGroup(out, 'dub', 'dub', serversObj.dub, nextId);

  return out;
}
