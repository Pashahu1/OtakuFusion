import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

/** Whether catalog metadata suggests an English dub exists (for resolve / auto-fallback only). */
export function computeHasAnyDub(input: {
  dubFromTv: number;
  episodes: EpisodesTypes[] | null;
}): boolean {
  if (input.dubFromTv > 0) return true;
  const episodes = input.episodes;
  if (!episodes?.length) return false;
  if (episodes.some((e) => e.hasDub === true)) return true;
  if (episodes.every((e) => e.hasDub === false)) return false;
  return false;
}
