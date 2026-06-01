const AUTOPLAY_KEY = 'otakufusion:player:autostart';

export function readPlaybackAutostartEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(AUTOPLAY_KEY);
    if (raw === '0' || raw === 'false') return false;
    return true;
  } catch {
    return true;
  }
}

export function writePlaybackAutostartEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTOPLAY_KEY, enabled ? '1' : '0');
  } catch {
    /* ignore */
  }
}
