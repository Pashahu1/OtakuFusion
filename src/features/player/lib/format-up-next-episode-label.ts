import { tStatic } from '@/i18n/t';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export interface UpNextCardContent {
  heading: string;
  title: string;
  subtitle: string;
}

export function formatUpNextEpisodeLabel(episode: EpisodesTypes): string {
  return formatUpNextCard(episode).title;
}

export function formatUpNextCard(episode: EpisodesTypes): UpNextCardContent {
  const number = episode.episode_no;
  const title = episode.title?.trim() ?? '';
  const jname = episode.jname?.trim() ?? '';
  const heading = tStatic('player.nextEpisode');

  if (number != null && title) {
    return {
      heading,
      title: `E${number} — ${title}`,
      subtitle: subtitleIfDistinct(title, jname),
    };
  }
  if (number != null) {
    return {
      heading,
      title: tStatic('watch.episodeNumber', { number }),
      subtitle: subtitleIfDistinct(tStatic('watch.episodeNumber', { number }), jname),
    };
  }
  return {
    heading,
    title: title || tStatic('player.nextEpisodeFallback'),
    subtitle: subtitleIfDistinct(title, jname),
  };
}

function subtitleIfDistinct(title: string, jname: string): string {
  if (!jname) return '';
  if (jname.toLowerCase() === title.toLowerCase()) return '';
  return jname;
}
