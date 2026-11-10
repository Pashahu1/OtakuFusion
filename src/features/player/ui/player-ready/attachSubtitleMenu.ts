import type Artplayer from 'artplayer';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';

import { resolveAndApplySubtitles } from '../netflix-tracks/resolveSubtitleTracks';

export function attachSubtitleMenu(
  art: Artplayer,
  subtitles: SubtitleItem[] | null,
  streamLang: 'sub' | 'dub' | null,
  assetRequestHeaders: Record<string, string>,
): void {
  resolveAndApplySubtitles(art, subtitles, streamLang, assetRequestHeaders);
}
