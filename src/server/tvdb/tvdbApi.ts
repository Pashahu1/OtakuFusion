import { TVDB_API } from './tvdbTypes';

export async function tvdbFetchJson<T>(
  url: string,
  token: string,
  revalidateSeconds: number,
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function tvdbSearchUrl(query: string): string {
  return `${TVDB_API}/search?query=${encodeURIComponent(query.trim())}&limit=25`;
}

export function tvdbSeriesArtworksUrl(seriesId: string): string {
  return `${TVDB_API}/series/${seriesId}/artworks`;
}
