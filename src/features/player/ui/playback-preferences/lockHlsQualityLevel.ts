/** Force a ladder index (`-1` = ABR). `startLevel` must match or the first fragment stays low. */
export function lockHlsQualityLevel(
  hls: {
    startLevel: number;
    currentLevel: number;
    nextLevel: number;
    loadLevel: number;
    startLoad?: (startPosition?: number) => void;
  },
  index: number,
  options?: { startLoad?: boolean },
): void {
  const next = Number.isFinite(index) ? index : -1;
  hls.startLevel = next;
  hls.currentLevel = next;
  hls.nextLevel = next;
  hls.loadLevel = next;
  if (!options?.startLoad) return;
  try {
    hls.startLoad?.();
  } catch {
    /* noop */
  }
}
