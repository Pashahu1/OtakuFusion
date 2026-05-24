/** Остання робочна якість Anilibria (720p тощо) — не плутати з `server_name` / Anicore. */

export const STORAGE_ANILIBERTY_PLAYBACK_QUALITY = 'aniliberty_playback_quality';

export function normalizeAnilibertyQualityHint(raw: string): string | null {
  const t = raw.trim().toLowerCase().replace(/\s+/g, '');
  if (!t) return null;
  const m = t.match(/^(\d{3,4})p?$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n) || n < 360 || n > 2160) return null;
  return `${n}p`;
}

export function heightFromAnilibertyServerLabel(server: string): number | null {
  const m = server.match(/(\d{3,4})p/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function readAnilibertyPlaybackQualityHint(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_ANILIBERTY_PLAYBACK_QUALITY);
    return raw ? normalizeAnilibertyQualityHint(raw) : null;
  } catch {
    return null;
  }
}

export function writeAnilibertyPlaybackQualityHint(
  quality: string | number
): void {
  if (typeof window === 'undefined') return;
  const normalized =
    typeof quality === 'number'
      ? normalizeAnilibertyQualityHint(`${quality}p`)
      : normalizeAnilibertyQualityHint(quality);
  if (!normalized) return;
  try {
    localStorage.setItem(STORAGE_ANILIBERTY_PLAYBACK_QUALITY, normalized);
  } catch {
    /* ignore */
  }
}

export function clearAnilibertyPlaybackQualityHint(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_ANILIBERTY_PLAYBACK_QUALITY);
  } catch {
    /* ignore */
  }
}
