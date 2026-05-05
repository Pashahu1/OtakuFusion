import type { Chapter, Segment } from '@/shared/types/VideoSegmentsTypes';

function isValidSegment(seg: Segment | null): seg is Segment {
  if (!seg) return false;
  if (!Number.isFinite(seg.start) || !Number.isFinite(seg.end)) return false;
  if (seg.start < 0 || seg.end <= 0) return false;
  return seg.end > seg.start;
}

export function createChapters(
  intro: Segment | null,
  outro: Segment | null
): Chapter[] {
  const chapters: Chapter[] = [];
  if (isValidSegment(intro) && (intro.start !== 0 || intro.end !== 0)) {
    chapters.push({ start: intro.start, end: intro.end, title: 'intro' });
  }
  if (isValidSegment(outro) && (outro.start !== 0 || outro.end !== 0)) {
    chapters.push({ start: outro.start, end: outro.end, title: 'outro' });
  }
  return chapters;
}
