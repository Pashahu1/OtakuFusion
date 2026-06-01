import type Artplayer from 'artplayer';
import { resolveAssetPlaybackUrl } from '../playerStream';
import { artplayerPluginVttThumbnail } from '../artPlayerPluginVttThumbnail';
import { scheduleIdle } from './scheduleIdle';

export function attachPreviewThumbnail(
  art: Artplayer,
  thumbnail: string | null,
  assetRequestHeaders: Record<string, string>
): void {
  if (!thumbnail) return;
  const thumbUrl = resolveAssetPlaybackUrl(thumbnail, assetRequestHeaders);
  scheduleIdle(() => {
    try {
      art.plugins.add(
        artplayerPluginVttThumbnail({
          vtt: thumbUrl,
        })
      );
    } catch {
    }
  });
}
