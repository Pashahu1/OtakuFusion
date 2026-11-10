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
import { attachIdleChromeHide } from './attachIdleChromeHide';
import { attachNetflixTracksPanel } from '../netflix-tracks/attachNetflixTracksPanel';
import { attachPlaybackQualityTracks } from '../netflix-tracks/attachPlaybackQualityTracks';
import { attachAnime4kEnhance } from '../anime4k/attachAnime4kEnhance';
import { bindSafePictureInPicture } from '../player-pip/safePictureInPicture';

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
  resumeTargetSeconds?: number,
): void {
  const assetRequestHeaders = getStreamHeaders(streamInfo ?? null, streamUrl ?? null);

  attachPlaybackAutostart(art, userPausedRef, artRef, { resumeTargetSeconds });
  bindSafePictureInPicture(art.video);
  const clearLogoReveal = attachLogoReveal(art);
  const clearPlayerA11y = attachPlayerA11y(art);
  const clearSkipOverlay = attachSkipIntroOutroOverlay(art, skipSegments);
  attachPreviewThumbnail(art, thumbnail, assetRequestHeaders);
  attachSubtitleMenu(art, subtitles, streamLang, assetRequestHeaders);
  const clearTracksPanel = attachNetflixTracksPanel(art);
  const clearQualityTracks = attachPlaybackQualityTracks(art, streamInfo ?? null, streamUrl);
  const clearAnime4kEnhance = attachAnime4kEnhance(art);
  const clearIdleChromeHide = attachIdleChromeHide(art);
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
    clearTracksPanel();
    clearQualityTracks();
    clearAnime4kEnhance();
    clearIdleChromeHide();
  });
}
