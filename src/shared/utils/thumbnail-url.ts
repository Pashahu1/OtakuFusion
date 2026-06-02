const THUMBNAIL_SEGMENT = /\/thumbnail\/\d+x\d+/;
const ANILIST_HOSTS = new Set(['s4.anilist.co', 'anilist.co']);
const ANILIST_COVER_SEGMENT = /\/cover\/(?:extraLarge|large|medium|small)\//i;

export const LIST_THUMBNAIL_RES = '600x900';

export const HERO_THUMBNAIL_RES = '1200x1800';

function parseResolutionPixels(resolution: string): number {
  const match = /^(\d+)x(\d+)$/i.exec(resolution.trim());
  if (!match) return 0;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return 0;
  return width * height;
}

function pickAniListCoverSize(resolution: string): 'medium' | 'large' {
  const pixels = parseResolutionPixels(resolution);
  const mediumBaseline = parseResolutionPixels('300x400');
  return pixels > mediumBaseline ? 'large' : 'medium';
}

export function isAniListCdnHost(url: string): boolean {
  if (!url?.trim()) return false;
  try {
    let u = url.trim();
    if (u.startsWith('//')) u = `https:${u}`;
    const parsed = new URL(u);
    return ANILIST_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export function anilistCoverUrl(url: string, size: 'medium' | 'large'): string {
  if (!url?.trim()) return '';
  let u = url.trim();
  if (u.startsWith('//')) u = `https:${u}`;
  if (!isAniListCdnHost(u) || !ANILIST_COVER_SEGMENT.test(u)) return u;
  return u.replace(ANILIST_COVER_SEGMENT, `/cover/${size}/`);
}

export function spotlightHeroBackgroundUrl(input: {
  heroImageUrl?: string;
  poster: string;
}): string {
  const tvdb = input.heroImageUrl?.trim();
  if (tvdb) return tvdb;
  return thumbnailUrl(input.poster, HERO_THUMBNAIL_RES);
}

/** Same-origin optimizer URL for canvas accent sampling (avoids full-size CDN fetch). */
export function nextImageProxyUrl(
  src: string,
  width: number,
  quality: number,
): string {
  if (!src?.trim()) return '';
  const params = new URLSearchParams({
    url: src.trim(),
    w: String(width),
    q: String(quality),
  });
  return `/_next/image?${params.toString()}`;
}

export function thumbnailUrl(url: string, resolution = LIST_THUMBNAIL_RES): string {
  if (!url || typeof url !== 'string') return '';
  let u = url.trim();
  if (u === '') return u;
  if (u.startsWith('//')) u = `https:${u}`;

  if (isAniListCdnHost(u)) {
    return anilistCoverUrl(u, pickAniListCoverSize(resolution));
  }

  if (THUMBNAIL_SEGMENT.test(u)) {
    return u.replace(THUMBNAIL_SEGMENT, `/thumbnail/${resolution}`);
  }
  return u;
}
