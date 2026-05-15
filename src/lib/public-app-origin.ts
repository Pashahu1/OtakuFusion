function stripTrailingSlash(s: string): string {
  return s.replace(/\/+$/, '');
}

function trimmed(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Базовий origin для `fetch` до маршрутів цього ж Next-застосунку.
 * У браузері — порожній рядок (відносні шляхи `/api/...`).
 * На сервері — `NEXT_PUBLIC_SITE_URL`, інакше `VERCEL_URL`, інакше localhost.
 */
export function getPublicAppOrigin(): string {
  if (typeof window !== 'undefined') {
    return '';
  }
  const site = trimmed(process.env.NEXT_PUBLIC_SITE_URL);
  if (site) return stripTrailingSlash(site);
  const vercel = trimmed(process.env.VERCEL_URL);
  if (vercel) return stripTrailingSlash(`https://${vercel}`);
  const port = trimmed(process.env.PORT) ?? '3000';
  return `http://127.0.0.1:${port}`;
}
