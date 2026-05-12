/** HTTP 4xx від edge/CDN — не намагаємося recover через Hls.startLoad. */
export function isHardHttpFailure(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as { response?: { code?: unknown } };
  const code = typeof d.response?.code === 'number' ? d.response.code : null;
  return code != null && code >= 400 && code < 500;
}

export function getPreferred720LevelIndex(
  levels: Array<{ height?: number }>
): number {
  if (!levels.length) return -1;
  const withHeight = levels
    .map((level, index) => ({ index, height: Number(level.height ?? 0) }))
    .filter((item) => Number.isFinite(item.height) && item.height > 0);
  if (!withHeight.length) return levels.length - 1;

  const atOrBelow720 = withHeight
    .filter((item) => item.height <= 720)
    .sort((a, b) => b.height - a.height);
  if (atOrBelow720.length) return atOrBelow720[0].index;

  const above720 = withHeight.sort((a, b) => a.height - b.height);
  return above720[0].index;
}
