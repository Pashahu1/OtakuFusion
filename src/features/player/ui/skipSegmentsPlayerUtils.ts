import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { ChapterItem } from './artPlayerPluginChapter';

export function skipSegmentsToChapterItems(
  segments: StreamingData['skipSegments'] | undefined
): ChapterItem[] {
  if (!segments) return [];
  const out: ChapterItem[] = [];
  const { intro, outro } = segments;
  if (
    intro &&
    typeof intro.start === 'number' &&
    typeof intro.end === 'number' &&
    intro.start < intro.end
  ) {
    out.push({ start: intro.start, end: intro.end, title: 'OP' });
  }
  if (
    outro &&
    typeof outro.start === 'number' &&
    typeof outro.end === 'number' &&
    outro.start < outro.end
  ) {
    out.push({ start: outro.start, end: outro.end, title: 'ED' });
  }
  return out;
}

/** Обрізає інтервали під фактичну тривалість відео — інакше `artplayerPluginChapter` кидає помилку. */
export function clampChaptersToDuration(
  chapters: ChapterItem[],
  durationSec: number
): ChapterItem[] {
  if (!Number.isFinite(durationSec) || durationSec <= 0) return [];
  const cap = Math.max(0, durationSec - 0.05);
  const sorted = [...chapters].sort((a, b) => a.start - b.start);
  const out: ChapterItem[] = [];
  for (const ch of sorted) {
    const start = Math.max(0, ch.start);
    const end = Math.min(ch.end, cap);
    if (!(start < end)) continue;
    out.push({ ...ch, start, end });
  }
  return out;
}
