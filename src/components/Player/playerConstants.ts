/** Без `@/lib/env.public` (Zod) — інакше весь zod тягнеться в клієнтський бандл плеєра. */
function readPublicOptional(key: string): string {
  if (typeof process === 'undefined') return '';
  const v = process.env[key];
  return typeof v === 'string' ? v.trim() : '';
}

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

export const PROXY_URL = readPublicOptional('NEXT_PUBLIC_PROXY_URL');

/**
 * AnimeKai віддає прямі m3u8; CDN часто дає 403 з Referer localhost — потрібен проксі.
 * За замовчуванням — same-origin `/api/m3u8-proxy` (без зовнішнього fly.dev).
 * Щоб вимкнути проксі: NEXT_PUBLIC_M3U8_PROXY_URL=direct
 * Зовнішній приклад: https://m3u8proxy.fly.dev/m3u8-proxy?url=
 */
const DEFAULT_M3U8_PROXY_URL = '/api/m3u8-proxy?url=';
const m3u8Raw = readPublicOptional('NEXT_PUBLIC_M3U8_PROXY_URL');
export const M3U8_PROXY_URL =
  m3u8Raw.toLowerCase() === 'direct' ? '' : m3u8Raw || DEFAULT_M3U8_PROXY_URL;

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
