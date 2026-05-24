

const KNOWN_ANIMEX_PLAYBACK_SERVERS = new Set([
  'mimi',
  'uwu',
  'mochi',
  'miku',
  'yuki',
  'beep',
]);

export const STORAGE_ANIMEX_PLAYBACK_SERVER = 'animex_playback_server';
const LEGACY_STORAGE_ANICORE_PLAYBACK_SERVER = 'anicore_playback_server';

export function normalizeAnimexPlaybackServerId(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidAnimexPlaybackServerHint(raw: string): boolean {
  const h = normalizeAnimexPlaybackServerId(raw);
  if (!h || /^\d{3,4}p$/i.test(h)) return false;
  if (h === 'japanese' || h === 'english' || h === 'resolved') return false;
  if (/^hd-\d/i.test(h)) return false;
  if (KNOWN_ANIMEX_PLAYBACK_SERVERS.has(h)) return true;
  return /^[a-z][a-z0-9_-]{0,15}$/.test(h);
}

export function readAnimexPlaybackServerHint(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw =
      localStorage.getItem(STORAGE_ANIMEX_PLAYBACK_SERVER) ??
      localStorage.getItem(LEGACY_STORAGE_ANICORE_PLAYBACK_SERVER);
    if (!raw?.trim()) return null;
    const id = normalizeAnimexPlaybackServerId(raw);
    return isValidAnimexPlaybackServerHint(id) ? id : null;
  } catch {
    return null;
  }
}

export function writeAnimexPlaybackServerHint(server: string): void {
  if (typeof window === 'undefined') return;
  const id = normalizeAnimexPlaybackServerId(server);
  if (!isValidAnimexPlaybackServerHint(id)) return;
  try {
    localStorage.setItem(STORAGE_ANIMEX_PLAYBACK_SERVER, id);
  } catch {

  }
}

export function clearAnimexPlaybackServerHint(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_ANIMEX_PLAYBACK_SERVER);
    localStorage.removeItem(LEGACY_STORAGE_ANICORE_PLAYBACK_SERVER);
  } catch {

  }
}
