import {
  ANIKOTO_PUBLIC_API_BASE,
  ANIKOTO_STREAM_SERVERS,
  type AnikotoStreamServerName,
} from '@/lib/catalog/providers/anikoto/anikotoApiBase';

export { ANIKOTO_STREAM_SERVERS };

export type AnikotoStreamServer = AnikotoStreamServerName;

export function getAnikotoApiBaseUrl(): string {
  const raw = process.env.ANIKOTO_API_BASE?.trim();
  const base = raw && raw.length > 0 ? raw : ANIKOTO_PUBLIC_API_BASE;
  return base.replace(/\/+$/, '');
}
