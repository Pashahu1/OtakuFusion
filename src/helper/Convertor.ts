const THUMBNAIL_SEGMENT = /\/thumbnail\/\d+x\d+/;
const ANILIST_HOSTS = new Set(['s4.anilist.co', 'anilist.co']);

export const LIST_THUMBNAIL_RES = '300x400';

export const HERO_THUMBNAIL_RES = '1200x1800';

export function Convertor(url: string, resolution = LIST_THUMBNAIL_RES) {
  if (!url || typeof url !== 'string') return '';
  let u = url.trim();
  if (u === '') return u;
  if (u.startsWith('//')) u = `https:${u}`;

  // AniList already serves high-quality CDN images.
  // Keep the original URL to avoid accidental downscaling.
  try {
    const parsed = new URL(u);
    if (ANILIST_HOSTS.has(parsed.hostname)) return u;
  } catch {
    return u;
  }

  if (THUMBNAIL_SEGMENT.test(u)) {
    return u.replace(THUMBNAIL_SEGMENT, `/thumbnail/${resolution}`);
  }
  return u;
}
