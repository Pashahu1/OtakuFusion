function stripTrailingSlash(s: string): string {
  return s.replace(/\/+$/, '');
}

function trimmed(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Base origin for `fetch` to this Next app's routes.
 * In browser — empty string (relative `/api/...` paths).
 * On server — `NEXT_PUBLIC_SITE_URL`, else `VERCEL_URL`, else localhost.
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
