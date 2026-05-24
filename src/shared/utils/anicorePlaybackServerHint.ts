

const KNOWN_ANICORE_PLAYBACK_SERVERS = new Set([
  'mimi',
  'uwu',
  'mochi',
  'miku',
  'yuki',
  'beep',
]);

export const STORAGE_ANICORE_PLAYBACK_SERVER = 'anicore_playback_server';

const PER_ANIME_KEY_PREFIX = 'anicore_playback_server:anime:';

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

/** Спочатку hint для поточного тайтлу, інакше глобальний (legacy). */
export function readAnicorePlaybackServerHintForAnime(
  localAnimeId?: string | null
): string | null {
  const animeId = localAnimeId?.trim();
  if (typeof window !== 'undefined' && animeId) {
    try {
      const raw = localStorage.getItem(`${PER_ANIME_KEY_PREFIX}${animeId}`);
      if (raw?.trim()) {
        const id = normalizeAnicorePlaybackServerId(raw);
        if (isValidAnicorePlaybackServerHint(id)) return id;
      }
    } catch {

    }
  }
  return readAnicorePlaybackServerHint();
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

export function writeAnicorePlaybackServerHintForAnime(
  localAnimeId: string,
  server: string
): void {
  if (typeof window === 'undefined') return;
  const animeId = localAnimeId.trim();
  const id = normalizeAnicorePlaybackServerId(server);
  if (!animeId || !isValidAnicorePlaybackServerHint(id)) return;
  try {
    localStorage.setItem(`${PER_ANIME_KEY_PREFIX}${animeId}`, id);
    writeAnicorePlaybackServerHint(id);
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

export function clearAnicorePlaybackServerHintForAnime(
  localAnimeId?: string | null
): void {
  if (typeof window === 'undefined') return;
  const animeId = localAnimeId?.trim();
  try {
    if (animeId) {
      localStorage.removeItem(`${PER_ANIME_KEY_PREFIX}${animeId}`);
    }
    clearAnicorePlaybackServerHint();
  } catch {

  }
}
