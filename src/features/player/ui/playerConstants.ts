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
  ESCAPE: 'escape',
} as const;

export type KeyCode = (typeof KEY_CODES)[keyof typeof KEY_CODES];

export const ANIKAI_PAGE_REFERER = 'https://anikai.to/';

/** Anikoto embed CDN — used when resolve omits `request_headers.Referer`. */
export const ANIKOTO_EMBED_REFERER = 'https://vidwish.live/';

/** Referer/Origin fallback when watch resolve omits `request_headers`. */
export const HLS_CDN_FALLBACK_REFERER = 'https://anikage.cc/';
export const HLS_CDN_FALLBACK_ORIGIN = 'https://anikage.cc';

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

export const LOGO_HIDE_DELAY_MS = 4500;
export const LOGO_FADE_OUT_MS = 900;
