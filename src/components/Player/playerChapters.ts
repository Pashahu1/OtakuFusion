import type { Chapter, Segment } from '@/shared/types/VideoSegmentsTypes';

export function createChapters(
  intro: Segment | null,
  outro: Segment | null
): Chapter[] {
  const chapters: Chapter[] = [];
  if (intro && (intro.start !== 0 || intro.end !== 0)) {
    chapters.push({ start: intro.start, end: intro.end, title: 'intro' });
  }
  if (outro && (outro.start !== 0 || outro.end !== 0)) {
    chapters.push({ start: outro.start, end: outro.end, title: 'outro' });
  }
  return chapters;
}
