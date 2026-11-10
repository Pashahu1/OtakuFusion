import { tStatic } from '@/i18n/t';

export interface PlaybackQualityOption {
  id: string;
  label: string;
  active: boolean;
}

function heightLabel(height: number): string {
  return `${Math.round(height)}p`;
}

/** Unique heights, highest bitrate per rung, tallest first. */
export function buildHlsLadderQualityOptions(
  levels: Array<{ height?: number; bitrate?: number }>,
  currentIndex: number,
  isAuto: boolean,
): PlaybackQualityOption[] {
  const bestByHeight = new Map<number, { index: number; bitrate: number }>();
  levels.forEach((level, index) => {
    const height = Number(level.height ?? 0);
    if (!Number.isFinite(height) || height <= 0) return;
    const bitrate = Number(level.bitrate ?? 0);
    const prev = bestByHeight.get(height);
    if (!prev || bitrate > prev.bitrate) bestByHeight.set(height, { index, bitrate });
  });

  const rungs = [...bestByHeight.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([height, row]) => ({
      id: `hls:${row.index}`,
      label: heightLabel(height),
      active: !isAuto && currentIndex === row.index,
    }));

  if (rungs.length < 2) return rungs;

  return [
    ...rungs,
    {
      id: 'hls:auto',
      label: tStatic('player.auto'),
      active: isAuto,
    },
  ];
}

export function buildVariantQualityOptions(
  variants: Array<{ height?: number; label?: string; url?: string }>,
  activeUrl: string,
): PlaybackQualityOption[] {
  const active = activeUrl.trim();
  const rows = variants
    .filter((v) => typeof v.url === 'string' && v.url.trim() && Number(v.height) > 0)
    .sort((a, b) => Number(b.height) - Number(a.height))
    .map((v) => {
      const url = v.url!.trim();
      const height = Number(v.height);
      return {
        id: `variant:${height}:${url}`,
        label: v.label?.trim() || heightLabel(height),
        active: url === active,
      };
    });

  return rows.length >= 2 ? rows : [];
}
