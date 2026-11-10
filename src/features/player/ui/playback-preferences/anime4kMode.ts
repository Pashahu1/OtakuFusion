import type { Mode as PluginAnime4kMode } from 'artplayer-plugin-anime4k';

const ANIME4K_MODE_KEY = 'otakufusion:player:anime4k-mode';

/** User-facing enhance presets. Restore maps to the plugin's `balanced` (Mode A Fast). */
export type Anime4kEnhanceMode = 'off' | 'restore' | 'quality' | 'auto';

const ENHANCE_MODES: readonly Anime4kEnhanceMode[] = ['auto', 'off', 'restore', 'quality'];

export function isAnime4kEnhanceMode(value: unknown): value is Anime4kEnhanceMode {
  return typeof value === 'string' && ENHANCE_MODES.includes(value as Anime4kEnhanceMode);
}

export function readAnime4kEnhanceMode(): Anime4kEnhanceMode {
  if (typeof window === 'undefined') return 'auto';
  try {
    const raw = localStorage.getItem(ANIME4K_MODE_KEY)?.trim();
    if (raw === 'balanced' || raw === 'performance') return 'restore';
    if (isAnime4kEnhanceMode(raw)) return raw;
  } catch {
    /* ignore */
  }
  return 'auto';
}

export function writeAnime4kEnhanceMode(mode: Anime4kEnhanceMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ANIME4K_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function toPluginAnime4kMode(mode: Anime4kEnhanceMode): PluginAnime4kMode {
  if (mode === 'restore') return 'balanced';
  return mode;
}

export function fromPluginAnime4kMode(mode: PluginAnime4kMode): Anime4kEnhanceMode {
  if (mode === 'balanced' || mode === 'performance') return 'restore';
  return mode;
}
