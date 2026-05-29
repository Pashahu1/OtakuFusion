import type Artplayer from 'artplayer';

import {
  clampChaptersToDuration,
  skipSegmentsToChapterItems,
} from '../skipSegmentsPlayerUtils';
import type { ChapterItem } from '../artPlayerPluginChapter';
import type { StreamingData } from '@/shared/types/StreamingTypes';

type ChapterPlugin = {
  update?: (o: { chapters?: ChapterItem[] }) => void;
};

/**
 * Intro/outro markers on timeline after `ready` (when video duration is known).
 */
export function attachArtplayerSkipSegmentsOnReady(
  art: Artplayer,
  skipSegments: StreamingData['skipSegments'] | undefined
) {
  const chapterPlugin = (art.plugins as { artplayerPluginChapter?: ChapterPlugin })
    .artplayerPluginChapter;
  const rawChapters = skipSegmentsToChapterItems(skipSegments);
  if (!rawChapters.length) return;

  const applyChapterMarkers = () => {
    const dur = art.video?.duration ?? art.duration;
    if (!Number.isFinite(dur) || dur <= 0) return;
    const clamped = clampChaptersToDuration(rawChapters, dur);
    if (!clamped.length) return;
    try {
      chapterPlugin?.update?.({ chapters: clamped });
    } catch {
      /* different release duration / invalid markers */
    }
  };

  art.once('video:loadedmetadata', applyChapterMarkers);
  applyChapterMarkers();
}
