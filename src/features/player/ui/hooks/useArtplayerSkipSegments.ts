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
 * Мітки intro/outro на таймлайні після `ready` (коли відома тривалість відео).
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
      /* різна тривалість релізу / некоректні мітки */
    }
  };

  art.once('video:loadedmetadata', applyChapterMarkers);
  applyChapterMarkers();
}
