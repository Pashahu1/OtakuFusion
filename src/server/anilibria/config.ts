import 'server-only';

/** База AniLiberty / Anilibria API v1 (див. OpenAPI на anilibria.top). */
export function getAnilibriaApiBaseUrl(): string {
  const raw = process.env.ANILIBRIA_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/$/, '');
  return 'https://anilibria.top/api/v1';
}
