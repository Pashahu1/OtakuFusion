export const PREFERRED_SERVERS = ['HD-1', 'HD-2'] as const;

export const SERVER_PRIORITY_ORDER = [
  'VidSrc',
  'T-Cloud',
  'HD-2',
  'HD-1',
  'MegaCloud',
] as const;

export const STORAGE_SERVER_NAME = 'server_name';
export const STORAGE_SERVER_TYPE = 'server_type';

/** Artplayer language menu: Japanese / sub track. */
export const WATCH_SERVER_SUB_ID = '1';
/** Artplayer language menu: English dub track (Anikoto). */
export const WATCH_SERVER_DUB_ID = '2';

export function watchServerIdFromLang(lang: 'sub' | 'dub'): string {
  return lang === 'dub' ? WATCH_SERVER_DUB_ID : WATCH_SERVER_SUB_ID;
}

export function isWatchDubServerId(id: string | null | undefined): boolean {
  return id === WATCH_SERVER_DUB_ID;
}

/** Part after "Sub ·" / "Dub ·" — compare saved server name with catalog. */
export function mirrorServerLabel(serverName: string): string {
  const parts = serverName.split('·');
  if (parts.length >= 2) return parts.slice(1).join('·').trim();
  return serverName.trim();
}
