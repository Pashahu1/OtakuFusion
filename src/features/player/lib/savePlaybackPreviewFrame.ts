import { captureVideoFrame } from '@/features/player/lib/captureVideoFrame';
import {
  emitPlaybackPreviewUpdated,
  episodePreviewKey,
  hasEpisodePreview,
  saveEpisodePreview,
} from '@/features/watch/lib/playback-preview-store';

export async function savePlaybackPreviewFrame(
  animeId: string,
  episodeId: string,
  video: HTMLVideoElement,
): Promise<boolean> {
  const id = animeId.trim();
  const ep = episodeId.trim();
  if (!id || !ep) return false;

  const blob = await captureVideoFrame(video);
  if (!blob) return false;

  const key = episodePreviewKey(id, ep);
  await saveEpisodePreview(key, blob);
  emitPlaybackPreviewUpdated(id, ep);
  return true;
}

/** First watch: capture a distinct still once natural playback passes ~12s. */
export async function saveEarlyEpisodePreviewIfMissing(
  animeId: string,
  episodeId: string,
  video: HTMLVideoElement,
): Promise<boolean> {
  const id = animeId.trim();
  const ep = episodeId.trim();
  if (!id || !ep) return false;

  const key = episodePreviewKey(id, ep);
  if (await hasEpisodePreview(key)) return false;

  return savePlaybackPreviewFrame(id, ep, video);
}
