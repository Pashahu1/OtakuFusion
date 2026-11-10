import type Artplayer from 'artplayer';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import { pickPreferredQualityVariant } from './pickPreferredStreamQuality';
import { getStreamFullUrl, getStreamHeaders } from './playerStream';

export function switchArtplayerToPlaylist(
  art: Artplayer,
  streamInfo: StreamingData | null,
  nextUrl: string,
): void {
  const url = nextUrl.trim();
  if (!url) return;

  const t = art.currentTime;
  const wasPaused = art.playing === false;
  const headers = getStreamHeaders(streamInfo, url);
  const nextFull = getStreamFullUrl(url, headers);

  void art.switchUrl(nextFull).then(() => {
    if (Number.isFinite(t) && t > 0) {
      const dur = art.video?.duration ?? art.duration;
      const cap =
        Number.isFinite(dur) && dur > 0 ? Math.min(t, Math.max(0, dur - 0.05)) : t;
      art.currentTime = cap;
    }
    if (!wasPaused) art.play().catch(() => {});
  });
}

/** Separate HLS playlists per resolution — start on the preferred (1080p) variant. */
export function attachStreamQualityMenu(
  art: Artplayer,
  streamInfo: StreamingData | null,
  rawPlaylistUrl: string,
): void {
  const variants = streamInfo?.qualityVariants;
  if (!variants?.length || variants.length < 2) return;

  const raw = rawPlaylistUrl.trim();
  const preferred = pickPreferredQualityVariant(variants, raw);
  if (!preferred.url || preferred.url === raw) return;

  switchArtplayerToPlaylist(art, streamInfo, preferred.url);
}
