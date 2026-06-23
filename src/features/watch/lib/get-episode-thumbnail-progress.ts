import type { ContinueWatchingEpisodeProgress } from '@/features/watch/hooks/useContinueWatchingEpisodeProgress';

export function getEpisodeThumbnailProgress(
  episodeKey: string,
  watchedEpisodes: Record<string, boolean>,
  continueProgress: ContinueWatchingEpisodeProgress | null,
): number {
  if (watchedEpisodes[episodeKey]) return 1;
  if (continueProgress?.episodeKey === episodeKey) {
    return continueProgress.progressRatio;
  }
  return 0;
}
