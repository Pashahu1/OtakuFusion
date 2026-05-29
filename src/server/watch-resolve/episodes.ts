import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export function pickEpisodeByNumber(
  episodes: EpisodesTypes[],
  episodeNo: number
): EpisodesTypes | null {
  const exact = episodes.find((ep) => ep.episode_no === episodeNo);
  if (exact) return exact;
  return episodes.find((ep) => ep.data_id === episodeNo) ?? null;
}
