import { captureVideoFrame } from '@/features/player/lib/captureVideoFrame';
import {
  emitPlaybackPreviewUpdated,
  episodePreviewKey,
  hasEpisodePreview,
  saveEpisodePreview,
} from '@/features/watch/lib/playback-preview-store';

export type EarlyPreviewResult = 'saved' | 'exists' | 'skipped';

export async function savePlaybackPreviewFrame(
  animeId: string,
  episodeId: string,
  video: HTMLVideoElement,
  options?: { rejectDark?: boolean },
): Promise<boolean> {
  const id = animeId.trim();
  const ep = episodeId.trim();
  if (!id || !ep) return false;

  const blob = await captureVideoFrame(video, { rejectDark: options?.rejectDark });
  if (!blob) return false;

  const key = episodePreviewKey(id, ep);
  await saveEpisodePreview(key, blob);
  emitPlaybackPreviewUpdated(id, ep);
  return true;
}

/** First watch: capture a distinct still once, never overwrite later (credits/pause). */
export async function saveEarlyEpisodePreviewIfMissing(
  animeId: string,
  episodeId: string,
  video: HTMLVideoElement,
  options?: { allowDark?: boolean },
): Promise<EarlyPreviewResult> {
  const id = animeId.trim();
  const ep = episodeId.trim();
  if (!id || !ep) return 'skipped';

  const key = episodePreviewKey(id, ep);
  if (await hasEpisodePreview(key)) return 'exists';

  const saved = await savePlaybackPreviewFrame(id, ep, video, {
    rejectDark: options?.allowDark ? false : true,
  });
  return saved ? 'saved' : 'skipped';
}
