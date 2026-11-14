export const ANIKOTO_PUBLIC_API_BASE = 'https://anikoto-api.vercel.app';

export const ANIKOTO_STREAM_SERVERS = ['hd-1', 'hd-2', 'hd-3'] as const;

export type AnikotoStreamServerName = (typeof ANIKOTO_STREAM_SERVERS)[number];

export function readAnikotoBrowserApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_ANIKOTO_API_BASE?.trim();
  const base = raw && raw.length > 0 ? raw : ANIKOTO_PUBLIC_API_BASE;
  return base.replace(/\/+$/, '');
}
