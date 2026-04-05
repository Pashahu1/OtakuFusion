const THUMBNAIL_SEGMENT = /\/thumbnail\/\d+x\d+/;

/** Постери в сітках / каруселях — легкий файл; не використовуй для full-bleed hero. */
export const LIST_THUMBNAIL_RES = '300x400';

/**
 * Full-bleed hero: велике джерело (≈2:3), інакше на десктопі `next/image` розтягує 300×400.
 * Якщо CDN поверне 404 — перевір наявність цього розміру на дзеркалі або зменши до `800x1200`.
 */
export const HERO_THUMBNAIL_RES = '1200x1800';

/**
 * Нормалізує URL постера CDN: стабільний сегмент `/thumbnail/WxH` + https для `//`.
 */
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
