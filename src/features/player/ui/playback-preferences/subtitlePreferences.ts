const SUBTITLE_PREF_KEY = 'otakufusion:player:subtitle';

type SubtitlePreference =
  | { mode: 'off' }
  | { mode: 'on'; label: string };

export function readSubtitlePreference(): SubtitlePreference | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SUBTITLE_PREF_KEY)?.trim();
    if (!raw) return null;
    if (raw === '__off__') return { mode: 'off' };
    return { mode: 'on', label: raw };
  } catch {
    return null;
  }
}

export function writeSubtitlePreference(pref: SubtitlePreference): void {
  if (typeof window === 'undefined') return;
  try {
    if (pref.mode === 'off') localStorage.setItem(SUBTITLE_PREF_KEY, '__off__');
    else localStorage.setItem(SUBTITLE_PREF_KEY, pref.label.trim());
  } catch {
    /* ignore */
  }
}
