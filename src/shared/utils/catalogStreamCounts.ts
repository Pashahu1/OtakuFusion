import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

/**
 * Агрегує наявність сабів/дубу по списку епізодів каталогу (AnimeKai API).
 * Логіка узгоджена з `getEpisodes`: саб за замовчуванням true, якщо API явно не заборонив.
 */
export function aggregateCatalogStreamCounts(episodes: EpisodesTypes[]): {
  has_sub: number;
  has_dub: number;
} {
  let has_sub = 0;
  let has_dub = 0;
  for (const ep of episodes) {
    if (ep.hasSub !== false) has_sub++;
    if (ep.hasDub === true) has_dub++;
  }
  return { has_sub, has_dub };
}
