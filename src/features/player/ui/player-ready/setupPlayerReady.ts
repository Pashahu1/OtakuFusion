import type Artplayer from 'artplayer';
import { getStreamHeaders } from '../playerStream';
import { handlePlayerKeydown } from '../playerKeydown';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import { attachPlaybackAutostart } from './attachPlaybackAutostart';
import { attachLogoReveal } from './attachLogoReveal';
import { attachPlayerA11y } from './attachPlayerA11y';
import { attachSkipIntroOutroOverlay } from './attachSkipIntroOutroOverlay';
import { attachSubtitleMenu } from './attachSubtitleMenu';
import { attachMobileSeekGestures } from './attachMobileSeekGestures';
import { attachPreviewThumbnail } from './attachPreviewThumbnail';

export function setupPlayerReady(
  art: Artplayer,
  thumbnail: string | null,
  userPausedRef: React.RefObject<boolean>,
  artRef: React.RefObject<HTMLDivElement | null>,
  subtitles: SubtitleItem[] | null,
  streamLang: 'sub' | 'dub' | null,
  skipSegments: StreamingData['skipSegments'] | null | undefined,
  streamInfo: StreamingData | null | undefined,
  streamUrl: string | null | undefined,
): void {
  const assetRequestHeaders = getStreamHeaders(streamInfo ?? null, streamUrl ?? null);

  attachPlaybackAutostart(art, userPausedRef, artRef);
  const clearLogoReveal = attachLogoReveal(art);
  const clearPlayerA11y = attachPlayerA11y(art);
  const clearSkipOverlay = attachSkipIntroOutroOverlay(art, skipSegments);
  attachPreviewThumbnail(art, thumbnail, assetRequestHeaders);
  attachSubtitleMenu(art, subtitles, streamLang, assetRequestHeaders);
  attachMobileSeekGestures(art);

  const onKeydown = (event: KeyboardEvent) => {
    handlePlayerKeydown(event, art);
  };
  document.addEventListener('keydown', onKeydown);

  art.on('destroy', () => {
    document.removeEventListener('keydown', onKeydown);
    clearSkipOverlay();
    clearLogoReveal();
    clearPlayerA11y();
  });
}
