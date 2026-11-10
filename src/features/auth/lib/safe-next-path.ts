const AUTH_PATH_PREFIX = '/auth';
const MAX_NEXT_PATH_LENGTH = 512;

function decodeOnce(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** Same-origin relative path only. Blocks open redirects and auth loops. */
export function sanitizeNextPath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;

  const decoded = decodeOnce(raw.trim());
  if (!decoded || decoded.length > MAX_NEXT_PATH_LENGTH) return null;
  if (!decoded.startsWith('/')) return null;
  if (decoded.startsWith('//') || decoded.startsWith('/\\')) return null;
  if (decoded.includes('\\') || decoded.includes('://')) return null;
  if (decoded === AUTH_PATH_PREFIX || decoded.startsWith(`${AUTH_PATH_PREFIX}/`)) {
    return null;
  }

  return decoded;
}

export function readNextPathFromSearch(search: string | URLSearchParams): string | null {
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search;
  return sanitizeNextPath(params.get('next'));
}

export function withNextQuery(href: string, nextPath: string | null | undefined): string {
  const safe = sanitizeNextPath(nextPath);
  if (!safe) return href;
  const separator = href.includes('?') ? '&' : '?';
  return `${href}${separator}next=${encodeURIComponent(safe)}`;
}

export function resolveReturnPath(pathname: string, search = ''): string | null {
  const fromQuery = readNextPathFromSearch(search);
  if (fromQuery) return fromQuery;

  const suffix =
    !search || search.startsWith('?') ? search : `?${search}`;
  return sanitizeNextPath(`${pathname}${suffix}`);
}
