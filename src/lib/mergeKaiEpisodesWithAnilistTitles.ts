import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

/**
 * Підставляє назви серій з AniList `Media.streamingEpisodes` (за номером у рядку «Episode N …»).
 * Якщо для номера немає запису в мапі — лишаємо назви з AnimeKai.
 */
export function mergeKaiEpisodesWithAnilistTitles(
  episodes: EpisodesTypes[],
  anilistEpisodeTitles: Readonly<Record<string, string>> | undefined
): EpisodesTypes[] {
  if (!anilistEpisodeTitles || !Object.keys(anilistEpisodeTitles).length) {
    return episodes;
  }
  return episodes.map((ep) => {
    const fromAl = anilistEpisodeTitles[String(ep.episode_no)];
    if (!fromAl?.trim()) return ep;
    const t = fromAl.trim();
    return { ...ep, title: t, jname: t };
  });
}
