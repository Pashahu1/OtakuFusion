import type { CrysolineAnilibertyEpisodeRow } from '@/server/crysoline/anilibertyClient';
import type { EpisodesTypes, GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

function toEpisodeQueryId(episodeNumber: number): string {
  return `?ep=${episodeNumber}`;
}

export function mapCrysolineAnilibertyEpisodes(
  rows: CrysolineAnilibertyEpisodeRow[]
): GetEpisodesResult {
  const episodeMap = new Map<
    number,
    {
      episode_no: number;
      id: string;
      data_id: number;
      jname: string;
      title: string;
      japanese_title: string;
      filler: boolean;
      variant: string;
      ep_token: string;
      hasSub: boolean;
      hasDub: boolean;
    }
  >();

  for (const row of rows) {
    const n = row.number;
    if (!Number.isFinite(n) || n <= 0) continue;
    const episodeNumber = Math.floor(n);
    const token = row.id?.trim();
    if (!token) continue;
    const titleBase =
      typeof row.title === 'string' && row.title.trim()
        ? row.title.trim()
        : `Episode ${episodeNumber}`;
    episodeMap.set(episodeNumber, {
      episode_no: episodeNumber,
      id: toEpisodeQueryId(episodeNumber),
      data_id: episodeNumber,
      jname: titleBase,
      title: titleBase,
      japanese_title: titleBase,
      filler: false,
      variant: 'Anilibria',
      ep_token: token,
      hasSub: true,
      hasDub: false,
    });
  }

  const episodes: EpisodesTypes[] = Array.from(episodeMap.values()).sort(
    (a, b) => a.episode_no - b.episode_no
  );

  return {
    episodes,
    totalEpisodes: episodes.length,
  };
}
