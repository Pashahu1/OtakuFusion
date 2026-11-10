export const THEME_STORAGE_KEY = 'otakufusion:theme';

export const APP_THEMES = ['dark', 'midnight', 'ember', 'neon', 'azure'] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_THEME: AppTheme = 'dark';

export interface ThemeSwatch {
  bg: string;
  surface: string;
  accent: string;
}

export const THEME_SWATCHES: Record<AppTheme, ThemeSwatch> = {
  dark: { bg: '#0c0c0e', surface: '#141519', accent: '#f47521' },
  midnight: { bg: '#000000', surface: '#0a0a0c', accent: '#f47521' },
  ember: { bg: '#140e0c', surface: '#1c1412', accent: '#ff7a2e' },
  neon: { bg: '#0c0710', surface: '#160e1a', accent: '#ff2d95' },
  azure: { bg: '#0b1218', surface: '#121a22', accent: '#5ba3d9' },
};

export function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && (APP_THEMES as readonly string[]).includes(value);
}

export function parseAppTheme(value: unknown): AppTheme {
  return isAppTheme(value) ? value : DEFAULT_THEME;
}

export function applyAppTheme(theme: AppTheme, root: HTMLElement = document.documentElement): void {
  root.setAttribute('data-theme', theme);
  root.classList.add('dark');
}

const THEME_BOOTSTRAP_ALLOWED = APP_THEMES.map((id) => JSON.stringify(id)).join(',');

export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var allowed=[${THEME_BOOTSTRAP_ALLOWED}];var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(allowed.indexOf(t)<0)t=${JSON.stringify(DEFAULT_THEME)};var r=document.documentElement;r.setAttribute('data-theme',t);r.classList.add('dark');var l=localStorage.getItem('otakufusion:locale');if(l==='en'||l==='uk'||l==='de')r.lang=l;}catch(e){}})();`;
