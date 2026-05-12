/** Без `process.env.NEXT_PUBLIC_*` у клієнтському плеєрі — лише фіксовані значення (перевірка поведінки / бандлу). */

export const KEY_CODES = {
  M: 'm',
  I: 'i',
  F: 'f',
  V: 'v',
  SPACE: ' ',
  ARROW_UP: 'arrowup',
  ARROW_DOWN: 'arrowdown',
  ARROW_RIGHT: 'arrowright',
  ARROW_LEFT: 'arrowleft',
} as const;

export type KeyCode = (typeof KEY_CODES)[keyof typeof KEY_CODES];

/** Загальний проксі для плеєра (раніше `NEXT_PUBLIC_PROXY_URL`). */
export const PROXY_URL = '';

/**
 * AnimeKai віддає прямі m3u8; CDN часто дає 403 з Referer localhost — same-origin проксі.
 * (Раніше можна було перевизначити через `NEXT_PUBLIC_M3U8_PROXY_URL` / `direct`.)
 */
export const M3U8_PROXY_URL = '/api/m3u8-proxy?url=';

/** Резерв, якщо немає embed_url у відповіді source. */
export const ANIKAI_PAGE_REFERER = 'https://anikai.to/';

export const DEFAULT_REFERER = 'https://megacloud.club/';
export const PLAYER_THEME_COLOR = '#ff640a';

export const SUBTITLE_DEFAULT_STYLE: Record<string, string> = {
  'font-weight': '400',
  height: 'fit-content',
  minWidth: 'fit-content',
  marginInline: 'auto',
  'margin-top': 'auto',
  'margin-bottom': '2rem',
  left: '50%',
  transform: 'translateX(-50%)',
  color: '#fff',
};

export const LOGO_HIDE_DELAY_MS = 2500;
