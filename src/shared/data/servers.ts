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

/** Частина після «Sub ·» / «Dub ·» — для порівняння збереженого імені сервера з каталогом. */
export function mirrorServerLabel(serverName: string): string {
  const parts = serverName.split('·');
  if (parts.length >= 2) return parts.slice(1).join('·').trim();
  return serverName.trim();
}
