import Hls from 'hls.js';

const HLS_QUALITY_KEY = 'otakufusion:player:hls-quality';
const SUBTITLE_PREF_KEY = 'otakufusion:player:subtitle';

/** Збережений вибір якості HLS (рядок у localStorage або порожньо = режим за замовчуванням). */
export type HlsQualityPreference =
  | 'auto'
  | 'best-display'
  | { height: number };

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

/**
 * Орієнтовна «коротка» сторона екрана в фізичних пікселях (для підбору сходинки під монітор / DPR).
 */
export function getApproxDisplayShortSidePx(): number {
  if (typeof window === 'undefined') return 1080;
  const dpr = Math.min(window.devicePixelRatio ?? 1, 3);
  const sw = window.screen.width * dpr;
  const sh = window.screen.height * dpr;
  return Math.round(Math.min(sw, sh));
}

/**
 * Найвища доступна сходинка, що не перевищує можливості екрана; якщо в маніфесті лише нижчі —
 * береться найвища з доступних (найкраща картинка при 2K тощо).
 */
export function getBestLevelIndexForDisplay(
  levels: Array<{ height?: number; bitrate?: number }>
): number {
  if (!levels.length) return -1;
  const cap = getApproxDisplayShortSidePx();
  const ranked = levels
    .map((level, index) => ({
      index,
      height: Number(level.height ?? 0),
      bitrate: Number(level.bitrate ?? 0),
    }))
    .filter((x) => Number.isFinite(x.height) && x.height > 0)
    .sort((a, b) => b.height - a.height || b.bitrate - a.bitrate);

  if (!ranked.length) return levels.length - 1;

  const fits = ranked.filter((x) => x.height <= cap);
  if (fits.length) return fits[0].index;

  return ranked[ranked.length - 1].index;
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
    if (raw === 'best-display' || raw === 'best') return 'best-display';
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return { height: Math.floor(n) };
    return null;
  } catch {
    return null;
  }
}

export function writeHlsQualityPreference(pref: HlsQualityPreference): void {
  if (typeof window === 'undefined') return;
  try {
    if (pref === 'auto') localStorage.setItem(HLS_QUALITY_KEY, 'auto');
    else if (pref === 'best-display')
      localStorage.setItem(HLS_QUALITY_KEY, 'best-display');
    else localStorage.setItem(HLS_QUALITY_KEY, String(pref.height));
  } catch {
    /* ignore */
  }
}

/** Індекс рівня або -1 для ABR (auto). */
export function resolveLevelIndexForStoredQuality(
  levels: Array<{ height?: number; bitrate?: number }>,
  pref: HlsQualityPreference | null
): number {
  if (!levels.length) return -1;
  if (pref === 'auto') return -1;
  /** Порожнє сховище або явний режим — найкраща сходинка під поточний екран. */
  if (pref === null || pref === 'best-display') {
    return getBestLevelIndexForDisplay(levels);
  }

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

export interface AttachHlsQualityPersistOptions {
  /** Не записувати у storage одразу після ініціалізації (зменшує гонку з початковим lock рівня). */
  muteInitialPersistenceMs?: number;
}

/**
 * Після вибору якості в artplayer-plugin-hls-control змінюється loadLevel / autoLevelEnabled.
 * Не викликати до завершення початкового apply (інакше затремо дефолт у сховище).
 */
export function attachHlsQualityPreferencePersistence(
  hls: InstanceType<typeof Hls>,
  onAfterPersist?: () => void,
  options?: AttachHlsQualityPersistOptions
): () => void {
  let allowPersist = false;
  const unlockTimer = window.setTimeout(() => {
    allowPersist = true;
  }, 450);

  const muteUntil =
    Date.now() + (options?.muteInitialPersistenceMs ?? 0);

  const handler = () => {
    if (!allowPersist) return;
    if (Date.now() < muteUntil) return;

    const stored = readHlsQualityPreference();
    const auto = readAutoLevelFlag(
      hls as { loadLevel?: number; autoLevelEnabled?: boolean }
    );

    if (auto) {
      writeHlsQualityPreference('auto');
      onAfterPersist?.();
      return;
    }

    const idx = hls.currentLevel;
    const h = idx >= 0 ? Number(hls.levels[idx]?.height ?? 0) : 0;

    if (stored === 'best-display' || stored === null) {
      const expected = getBestLevelIndexForDisplay(
        hls.levels as Array<{ height?: number; bitrate?: number }>
      );
      if (
        idx === expected &&
        Number.isFinite(h) &&
        h > 0 &&
        idx >= 0
      ) {
        writeHlsQualityPreference('best-display');
        onAfterPersist?.();
        return;
      }
      if (Number.isFinite(h) && h > 0 && idx >= 0) {
        writeHlsQualityPreference({ height: h });
      }
      onAfterPersist?.();
      return;
    }

    if (Number.isFinite(h) && h > 0) writeHlsQualityPreference({ height: h });
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
