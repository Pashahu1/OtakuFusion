export const ANIKOTO_STREAM_SERVERS = ['hd-1', 'hd-2', 'hd-3'] as const;

export type AnikotoStreamServer = (typeof ANIKOTO_STREAM_SERVERS)[number];

export function getAnikotoApiBaseUrl(): string {
  const raw = process.env.ANIKOTO_API_BASE?.trim();
  const base = raw && raw.length > 0 ? raw : 'https://anikoto-api.vercel.app';
  return base.replace(/\/+$/, '');
}
