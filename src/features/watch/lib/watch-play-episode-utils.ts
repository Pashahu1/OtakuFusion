import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { episodeMatchesSelection } from '@/shared/utils/episodeUtils';

export function findWatchEpisode(
  episodes: EpisodesTypes[] | null | undefined,
  episodeId: string | null | undefined
): EpisodesTypes | null {
  if (!episodes?.length || episodeId == null) return null;
  return episodes.find((ep) => episodeMatchesSelection(ep, episodeId)) ?? null;
}

export function findNextWatchEpisode(
  episodes: EpisodesTypes[] | null | undefined,
  current: EpisodesTypes | null
): EpisodesTypes | null {
  if (!episodes?.length || !current) return null;
  const nextNo = current.episode_no + 1;
  return episodes.find((ep) => ep.episode_no === nextNo) ?? null;
}

export function findPrevWatchEpisode(
  episodes: EpisodesTypes[] | null | undefined,
  current: EpisodesTypes | null,
): EpisodesTypes | null {
  if (!episodes?.length || !current) return null;
  const prevNo = current.episode_no - 1;
  if (prevNo < 1) return null;
  return episodes.find((ep) => ep.episode_no === prevNo) ?? null;
}
