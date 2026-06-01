export const RESEND_COOLDOWN_SEC = 30;

export function digitsOnly(value: string, maxLen: number) {
  return value.replace(/\D/g, '').slice(0, maxLen);
}

export function emailsMatch(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export { readApiMessage } from '@/lib/read-api-message';
