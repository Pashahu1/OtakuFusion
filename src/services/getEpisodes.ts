import { animekaiApi } from '@/lib/animekai-api';
import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

interface AnimeKaiEpisode {
  number?: string | number;
  /** Деякі відповіді API використовують інші ключі замість `number`. */
  episode?: string | number;
  ep?: string | number;
  episode_num?: string | number;
  episode_number?: string | number;
  slug?: string;
  title?: string;
  japanese_title?: string;
  token?: string;
  has_sub?: boolean;
  has_dub?: boolean;
}

interface AnimeKaiEpisodesResponse {
  success?: boolean;
  episodes?: AnimeKaiEpisode[];
  count?: number;
  error?: string;
}

function toEpisodeQueryId(episodeNumber: number): string {
  return `?ep=${episodeNumber}`;
}

function toSafeEpisodeNumber(value: number | string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return Math.floor(parsed);
}

/**
 * Номер епізоду з полів API. Якщо номера немає — позиція в масиві (1-based),
 * інакше всі рядки зліпляться в один `episode_no === 1` і лишається один ep_token.
 */
function resolveEpisodeNumber(
  episode: AnimeKaiEpisode,
  indexInResponse: number
): number {
  const candidates: unknown[] = [
    episode.number,
    episode.episode,
    episode.ep,
    episode.episode_num,
    episode.episode_number,
  ];
  for (const c of candidates) {
    if (c === undefined || c === null) continue;
    if (typeof c === 'string' && !c.trim()) continue;
    const n = toSafeEpisodeNumber(c as number | string);
    if (n >= 1) return n;
  }
  return indexInResponse + 1;
}

/** API інколи віддає 1 / "1" замість boolean. */
function isExplicitTrue(v: unknown): boolean {
  if (v === true) return true;
  if (typeof v === 'number' && v === 1) return true;
  if (typeof v === 'string') {
    const t = v.trim().toLowerCase();
    return t === '1' || t === 'true' || t === 'yes';
  }
  return false;
}

function isExplicitFalse(v: unknown): boolean {
  if (v === false) return true;
  if (typeof v === 'number' && v === 0) return true;
  if (typeof v === 'string') {
    const t = v.trim().toLowerCase();
    return t === '0' || t === 'false' || t === 'no';
  }
  return false;
}

export async function getEpisodes(
  aniId: string,
  signal?: AbortSignal
): Promise<GetEpisodesResult> {
  const trimmed = aniId.trim();
  if (!trimmed) {
    return { episodes: [], totalEpisodes: 0 };
  }

  const data = await animekaiApi.get<AnimeKaiEpisodesResponse>(
    `/api/episodes/${encodeURIComponent(trimmed)}`,
    60,
    signal
  );

  if (typeof data.error === 'string' && data.error.trim()) {
    throw new Error(data.error.trim());
  }

  const episodesRaw = Array.isArray(data.episodes) ? data.episodes : [];
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

  for (let i = 0; i < episodesRaw.length; i++) {
    const episode = episodesRaw[i];
    const episodeNumber = resolveEpisodeNumber(episode, i);
    const token = episode.token?.trim() ?? '';
    if (!token) continue;

    const title =
      episode.title?.trim() || `Episode ${episodeNumber}`;
    const jp = episode.japanese_title?.trim() || title;
    const hasSub = isExplicitFalse(episode.has_sub) ? false : true;
    const hasDub = isExplicitTrue(episode.has_dub);
    const existing = episodeMap.get(episodeNumber);

    if (!existing) {
      episodeMap.set(episodeNumber, {
        episode_no: episodeNumber,
        id: toEpisodeQueryId(episodeNumber),
        data_id: episodeNumber,
        jname: title,
        title,
        japanese_title: jp,
        filler: false,
        variant: hasSub && hasDub ? 'Sub | Dub' : hasDub ? 'Dub' : 'Sub',
        ep_token: token,
        hasSub,
        hasDub,
      });
      continue;
    }

    const mergedHasSub = existing.hasSub || hasSub;
    const mergedHasDub = existing.hasDub || hasDub;
    existing.hasSub = mergedHasSub;
    existing.hasDub = mergedHasDub;
    existing.ep_token = token;
    if (existing.title.startsWith('Episode ') && !title.startsWith('Episode ')) {
      existing.title = title;
      existing.jname = title;
      existing.japanese_title = jp;
    }
    existing.variant =
      mergedHasSub && mergedHasDub ? 'Sub | Dub' : mergedHasDub ? 'Dub' : 'Sub';
  }

  const episodes = Array.from(episodeMap.values())
    .sort((a, b) => a.episode_no - b.episode_no)
    .map(({ hasSub, hasDub, ...rest }) => ({
      ...rest,
      hasSub,
      hasDub,
    }));

  const totalEpisodes =
    typeof data.count === 'number' && data.count > 0
      ? data.count
      : episodes.length;

  return {
    episodes,
    totalEpisodes,
  };
}
