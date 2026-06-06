import type { AnikotoEpisodeRow } from '@/server/anikoto/types';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export function mapAnikotoEpisodes(rows: AnikotoEpisodeRow[]): EpisodesTypes[] {
  return rows
    .filter((row) => Number.isFinite(row.num) && row.num > 0)
    .map((row) => {
      const episodeNo = Math.floor(row.num);
      const title = row.title?.trim() || `Episode ${episodeNo}`;
      return {
        episode_no: episodeNo,
        id: `?ep=${episodeNo}`,
        data_id: episodeNo,
        jname: title,
        title,
        japanese_title: title,
        filler: row.isFiller === true,
        variant: 'Anikoto',
        ep_token: String(episodeNo),
        hasSub: row.isSub === true,
        hasDub: row.isDub === true,
      };
    })
    .sort((a, b) => a.episode_no - b.episode_no);
}
