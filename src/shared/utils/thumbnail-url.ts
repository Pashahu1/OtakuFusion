const THUMBNAIL_SEGMENT = /\/thumbnail\/\d+x\d+/;
const ANILIST_HOSTS = new Set(['s4.anilist.co', 'anilist.co']);
const ANILIST_COVER_SEGMENT = /\/cover\/(?:extraLarge|large|medium|small)\//i;

export const LIST_THUMBNAIL_RES = '300x400';

export const HERO_THUMBNAIL_RES = '1200x1800';

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
    return resolution === HERO_THUMBNAIL_RES
      ? anilistCoverUrl(u, 'large')
      : anilistCoverUrl(u, 'medium');
  }

  if (THUMBNAIL_SEGMENT.test(u)) {
    return u.replace(THUMBNAIL_SEGMENT, `/thumbnail/${resolution}`);
  }
  return u;
}
