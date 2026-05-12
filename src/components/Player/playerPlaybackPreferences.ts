import Hls from 'hls.js';

const HLS_QUALITY_KEY = 'otakufusion:player:hls-quality';
const SUBTITLE_PREF_KEY = 'otakufusion:player:subtitle';

type HlsQualityPreference = 'auto' | { height: number };

type SubtitlePreference =
  | { mode: 'off' }
  | { mode: 'on'; label: string };

/** HTTP 4xx від edge/CDN — не намагаємося recover через Hls.startLoad. */
export function isHardHttpFailure(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as { response?: { code?: unknown } };
  const code = typeof d.response?.code === 'number' ? d.response.code : null;
  return code != null && code >= 400 && code < 500;
}

/** Дефолтний рівень якості (найвищий не вище 1080p), якщо в localStorage ще немає вибору. */
export function getPreferred1080LevelIndex(
  levels: Array<{ height?: number }>
): number {
  if (!levels.length) return -1;
  const withHeight = levels
    .map((level, index) => ({ index, height: Number(level.height ?? 0) }))
    .filter((item) => Number.isFinite(item.height) && item.height > 0);
  if (!withHeight.length) return levels.length - 1;

  const atOrBelow1080 = withHeight
    .filter((item) => item.height <= 1080)
    .sort((a, b) => b.height - a.height);
  if (atOrBelow1080.length) return atOrBelow1080[0].index;

  const above1080 = withHeight.sort((a, b) => a.height - b.height);
  return above1080[0].index;
}

export function readHlsQualityPreference(): HlsQualityPreference | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HLS_QUALITY_KEY)?.trim();
    if (!raw) return null;
    if (raw === 'auto') return 'auto';
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return { height: Math.floor(n) };
    return null;
  } catch {
    return null;
  }
}

function writeHlsQualityPreference(pref: HlsQualityPreference): void {
  if (typeof window === 'undefined') return;
  try {
    if (pref === 'auto') localStorage.setItem(HLS_QUALITY_KEY, 'auto');
    else localStorage.setItem(HLS_QUALITY_KEY, String(pref.height));
  } catch {
    /* ignore */
  }
}

/** Індекс рівня або -1 для ABR (auto). */
export function resolveLevelIndexForStoredQuality(
  levels: Array<{ height?: number }>,
  pref: HlsQualityPreference | null
): number {
  if (!levels.length) return -1;
  if (pref === 'auto') return -1;
  if (!pref) return -1;

  const target = pref.height;
  const ranked = levels
    .map((level, index) => ({
      index,
      height: Number(level.height ?? 0),
    }))
    .filter((x) => Number.isFinite(x.height) && x.height > 0);

  if (!ranked.length) return -1;

  const exact = ranked.find((x) => x.height === target);
  if (exact) return exact.index;

  const atOrBelow = ranked
    .filter((x) => x.height <= target)
    .sort((a, b) => b.height - a.height);
  if (atOrBelow.length) return atOrBelow[0].index;

  return ranked.sort((a, b) => a.height - b.height)[0]?.index ?? -1;
}

function readAutoLevelFlag(hls: { loadLevel?: number; autoLevelEnabled?: boolean }): boolean {
  if (typeof hls.autoLevelEnabled === 'boolean') return hls.autoLevelEnabled;
  return hls.loadLevel === -1;
}

/**
 * Після вибору якості в artplayer-plugin-hls-control змінюється loadLevel / autoLevelEnabled.
 * Не викликати до завершення початкового apply (інакше затремо дефолт у сховище).
 */
export function attachHlsQualityPreferencePersistence(
  hls: InstanceType<typeof Hls>,
  onAfterPersist?: () => void
): () => void {
  let allowPersist = false;
  const unlockTimer = window.setTimeout(() => {
    allowPersist = true;
  }, 450);

  const handler = () => {
    if (!allowPersist) return;
    if (readAutoLevelFlag(hls as { loadLevel?: number; autoLevelEnabled?: boolean })) {
      writeHlsQualityPreference('auto');
    } else {
      const idx = hls.currentLevel;
      const h = idx >= 0 ? Number(hls.levels[idx]?.height ?? 0) : 0;
      if (Number.isFinite(h) && h > 0) writeHlsQualityPreference({ height: h });
    }
    onAfterPersist?.();
  };

  hls.on(Hls.Events.LEVEL_SWITCHED, handler);
  return () => {
    window.clearTimeout(unlockTimer);
    hls.off(Hls.Events.LEVEL_SWITCHED, handler);
  };
}

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
