const THUMBNAIL_SEGMENT = /\/thumbnail\/\d+x\d+/;

export const LIST_THUMBNAIL_RES = '300x400';

export const HERO_THUMBNAIL_RES = '1200x1800';

export function Convertor(url: string, resolution = LIST_THUMBNAIL_RES) {
  if (!url || typeof url !== 'string') return '';
  let u = url.trim();
  if (u === '') return u;
  if (u.startsWith('//')) u = `https:${u}`;
  if (THUMBNAIL_SEGMENT.test(u)) {
    return u.replace(THUMBNAIL_SEGMENT, `/thumbnail/${resolution}`);
  }
  return u;
}
