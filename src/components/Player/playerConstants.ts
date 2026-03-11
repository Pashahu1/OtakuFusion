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

export const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;
export const M3U8_PROXY_URL = process.env.NEXT_PUBLIC_M3U8_PROXY_URL;

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
