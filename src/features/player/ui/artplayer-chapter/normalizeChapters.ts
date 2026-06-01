import type { ChapterItem } from './types';

export function normalizeChaptersForDuration(
  chapters: ChapterItem[],
  duration: number,
): ChapterItem[] {
  const sorted = [...chapters].sort((x, y) => x.start - y.start);

  for (let i = 0; i < sorted.length; i++) {
    const chapter = sorted[i];
    const nextChapter = sorted[i + 1];

    if (chapter.end === Infinity) {
      chapter.end = duration;
    }
    if (
      typeof chapter.start !== 'number' ||
      typeof chapter.end !== 'number' ||
      typeof chapter.title !== 'string'
    ) {
      throw new Error('Illegal chapter data type');
    }
    if (
      chapter.start < 0 ||
      chapter.end > Math.ceil(duration) ||
      chapter.start >= chapter.end
    ) {
      throw new Error('Illegal chapter time point');
    }
    if (nextChapter && chapter.end > nextChapter.start) {
      throw new Error('Illegal chapter time point');
    }
  }

  if (sorted[0].start > 0) {
    sorted.unshift({ start: 0, end: sorted[0].start, title: '' });
  }
  if (sorted[sorted.length - 1].end < duration) {
    sorted.push({
      start: sorted[sorted.length - 1].end,
      end: duration,
      title: '',
    });
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].end !== sorted[i + 1].start) {
      sorted.splice(i + 1, 0, {
        start: sorted[i].end,
        end: sorted[i + 1].start,
        title: '',
      });
    }
  }

  return sorted;
}
