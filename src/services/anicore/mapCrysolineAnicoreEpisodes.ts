import type { CrysolineAnicoreEpisodeRow } from '@/server/crysoline/anicoreClient';
import type { EpisodesTypes, GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

function toEpisodeQueryId(episodeNumber: number): string {
  return `?ep=${episodeNumber}`;
}

function episodeHasSubProviders(row: CrysolineAnicoreEpisodeRow): boolean {
  const list = row.metadata?.subProviders;
  return Array.isArray(list) && list.length > 0;
}

function episodeHasDubProviders(row: CrysolineAnicoreEpisodeRow): boolean {
  const list = row.metadata?.dubProviders;
  return Array.isArray(list) && list.length > 0;
}

export function mapCrysolineAnicoreEpisodes(
  rows: CrysolineAnicoreEpisodeRow[]
): GetEpisodesResult {
  const episodes: EpisodesTypes[] = [];

  for (const row of rows) {
    const n = row.number;
    if (!Number.isFinite(n) || n <= 0) continue;
    const episodeNumber = Math.floor(n);
    const token = row.id?.trim() || String(episodeNumber);
    const titleBase =
      typeof row.title === 'string' && row.title.trim()
        ? row.title.trim()
        : `Episode ${episodeNumber}`;
    const hasSub = episodeHasSubProviders(row);
    const hasDub = episodeHasDubProviders(row);
    const filler = row.isFiller === true || row.metadata?.isFiller === true;
    const variant =
      hasSub && hasDub ? 'Sub | Dub' : hasDub ? 'Dub' : hasSub ? 'Sub' : 'Sub';

    episodes.push({
      episode_no: episodeNumber,
      id: toEpisodeQueryId(episodeNumber),
      data_id: episodeNumber,
      jname: titleBase,
      title: titleBase,
      japanese_title: titleBase,
      filler,
      variant,
      ep_token: token,
      hasSub: hasSub || !hasDub,
      hasDub,
    });
  }

  episodes.sort((a, b) => a.episode_no - b.episode_no);

  return {
    episodes,
    totalEpisodes: episodes.length,
  };
}

export function seriesHasDubFromAnicoreEpisodes(rows: CrysolineAnicoreEpisodeRow[]): boolean {
  return rows.some((r) => episodeHasDubProviders(r));
}
