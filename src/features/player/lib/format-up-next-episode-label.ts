import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export function formatUpNextEpisodeLabel(episode: EpisodesTypes): string {
  const number = episode.episode_no;
  const title = episode.title?.trim();
  if (number != null && title) {
    return `Episode ${number} · ${title}`;
  }
  if (number != null) {
    return `Episode ${number}`;
  }
  return title || 'Next episode';
}
