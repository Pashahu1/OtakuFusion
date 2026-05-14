import type { CrysolineAnimepaheEpisodeRow } from '@/server/crysoline/animepaheClient';
import type { EpisodesTypes, GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

function toEpisodeQueryId(episodeNumber: number): string {
  return `?ep=${episodeNumber}`;
}

/**
 * Відповідь GET /api/v1/anime/animepahe/episodes/{seriesId} — масив серій.
 */
export function mapCrysolineAnimepaheEpisodes(
  rows: CrysolineAnimepaheEpisodeRow[]
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
    const hash = row.id?.trim();
    if (!hash) continue;
    const titleBase =
      typeof row.title === 'string' && row.title.trim()
        ? row.title.trim()
        : `Episode ${episodeNumber}`;
    const existing = episodeMap.get(episodeNumber);
    if (!existing) {
      episodeMap.set(episodeNumber, {
        episode_no: episodeNumber,
        id: toEpisodeQueryId(episodeNumber),
        data_id: episodeNumber,
        jname: titleBase,
        title: titleBase,
        japanese_title: titleBase,
        filler: false,
        variant: 'Sub',
        ep_token: hash,
        hasSub: true,
        hasDub: false,
      });
      continue;
    }
    existing.ep_token = hash;
    if (existing.title.startsWith('Episode ') && !titleBase.startsWith('Episode ')) {
      existing.title = titleBase;
      existing.jname = titleBase;
      existing.japanese_title = titleBase;
    }
  }

  const episodes: EpisodesTypes[] = Array.from(episodeMap.values())
    .sort((a, b) => a.episode_no - b.episode_no)
    .map(({ hasSub, hasDub, ...rest }) => ({
      ...rest,
      hasSub,
      hasDub,
    }));

  return {
    episodes,
    totalEpisodes: episodes.length,
  };
}
