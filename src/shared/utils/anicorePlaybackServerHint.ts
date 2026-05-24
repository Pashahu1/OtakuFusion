

const KNOWN_ANICORE_PLAYBACK_SERVERS = new Set([
  'mimi',
  'uwu',
  'mochi',
  'miku',
  'yuki',
  'beep',
]);

export const STORAGE_ANICORE_PLAYBACK_SERVER = 'anicore_playback_server';

export function normalizeAnicorePlaybackServerId(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidAnicorePlaybackServerHint(raw: string): boolean {
  const h = normalizeAnicorePlaybackServerId(raw);
  if (!h || /^\d{3,4}p$/i.test(h)) return false;
  if (h === 'japanese' || h === 'english' || h === 'resolved') return false;
  if (/^hd-\d/i.test(h)) return false;
  if (KNOWN_ANICORE_PLAYBACK_SERVERS.has(h)) return true;
  return /^[a-z][a-z0-9_-]{0,15}$/.test(h);
}

export function readAnicorePlaybackServerHint(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_ANICORE_PLAYBACK_SERVER);
    if (!raw?.trim()) return null;
    const id = normalizeAnicorePlaybackServerId(raw);
    return isValidAnicorePlaybackServerHint(id) ? id : null;
  } catch {
    return null;
  }
}

export function writeAnicorePlaybackServerHint(server: string): void {
  if (typeof window === 'undefined') return;
  const id = normalizeAnicorePlaybackServerId(server);
  if (!isValidAnicorePlaybackServerHint(id)) return;
  try {
    localStorage.setItem(STORAGE_ANICORE_PLAYBACK_SERVER, id);
  } catch {

  }
}

export function clearAnicorePlaybackServerHint(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_ANICORE_PLAYBACK_SERVER);
  } catch {

  }
}
