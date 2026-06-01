import { getAnimePaheEpisodesCached } from '@/server/animepahe/episodesCached';
import { pickEpisodeByNumber } from '@/server/watch-resolve/episodes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export async function loadAnimepaheEpisodeContext(
  seriesId: string,
  episode: number,
  epTokenOverride: string | null | undefined,
  episodeHasDub: boolean | null | undefined,
): Promise<{ epHash: string; targetEpisode: EpisodesTypes | null }> {
  let epHash = epTokenOverride?.trim() ?? '';
  let targetEpisode: EpisodesTypes | null = null;

  if (!epHash || episodeHasDub == null) {
    const episodesResult = await getAnimePaheEpisodesCached(seriesId);
    targetEpisode = pickEpisodeByNumber(episodesResult.episodes, episode);
    if (!epHash) epHash = targetEpisode?.ep_token?.trim() ?? '';
  } else {
    targetEpisode = {
      episode_no: episode,
      id: String(episode),
      data_id: episode,
      jname: '',
      title: '',
      japanese_title: '',
      ep_token: epHash,
      hasSub: true,
      hasDub: episodeHasDub === true,
    };
  }

  return { epHash, targetEpisode };
}
