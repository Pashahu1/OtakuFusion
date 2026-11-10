import i18n from './config';

export function tStatic(key: string, options?: Record<string, unknown>): string {
  return String(i18n.t(key, { ...(options ?? {}) }));
}
