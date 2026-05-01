import { videoApiUrl } from '@/lib/video-api';
import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

interface MoruroEpisode {
  episodeNumber: number | string;
  title?: string;
  image?: string;
  isSub?: boolean;
  isDub?: boolean;
  sub?: boolean;
  dub?: boolean;
  hasSub?: boolean;
  hasDub?: boolean;
  isFiller?: boolean;
}

interface MoruroEpisodesResponse {
  episodes?: MoruroEpisode[];
  totalEpisodes?: number;
}

function unwrapEpisodesPayload(input: unknown): MoruroEpisodesResponse {
  if (!input || typeof input !== 'object') return {};
  if ('results' in input) {
    const results = (input as { results?: unknown }).results;
    if (results && typeof results === 'object') {
      return results as MoruroEpisodesResponse;
    }
  }
  return input as MoruroEpisodesResponse;
}

async function fetchEpisodesPayload(id: string): Promise<MoruroEpisodesResponse> {
  const payload = await videoApiUrl.get<unknown>(
    `/api/episodes?id=${encodeURIComponent(id)}`,
    30
  );
  return unwrapEpisodesPayload(payload);
}

function toEpisodeId(episodeNumber: number): string {
  return `?ep=${episodeNumber}`;
}

function toSafeEpisodeNumber(value: number | string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return Math.floor(parsed);
}

function resolveAudioFlags(episode: MoruroEpisode): {
  hasSub: boolean;
  hasDub: boolean;
} {
  const subCandidates = [episode.isSub, episode.sub, episode.hasSub];
  const dubCandidates = [episode.isDub, episode.dub, episode.hasDub];
  const hasExplicitSub = subCandidates.some((value) => typeof value === 'boolean');
  const hasExplicitDub = dubCandidates.some((value) => typeof value === 'boolean');

  if (!hasExplicitSub && !hasExplicitDub) {
    return { hasSub: true, hasDub: true };
  }

  return {
    hasSub: subCandidates.some((value) => value === true),
    hasDub: dubCandidates.some((value) => value === true),
  };
}

export async function getEpisodes(
  id: string
): Promise<GetEpisodesResult> {
  const data = await fetchEpisodesPayload(id);
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
      hasSub: boolean;
      hasDub: boolean;
    }
  >();

  for (const episode of episodesRaw) {
    const episodeNumber = toSafeEpisodeNumber(episode.episodeNumber);
    const title = episode.title?.trim() || `Episode ${episodeNumber}`;
    const { hasSub, hasDub } = resolveAudioFlags(episode);
    const existing = episodeMap.get(episodeNumber);

    if (!existing) {
      episodeMap.set(episodeNumber, {
        episode_no: episodeNumber,
        id: toEpisodeId(episodeNumber),
        data_id: episodeNumber,
        jname: title,
        title,
        japanese_title: title,
        filler: Boolean(episode.isFiller),
        variant: hasSub && hasDub ? 'Sub | Dub' : hasDub ? 'Dub' : 'Sub',
        hasSub,
        hasDub,
      });
      continue;
    }

    const mergedHasSub = existing.hasSub || hasSub;
    const mergedHasDub = existing.hasDub || hasDub;
    existing.hasSub = mergedHasSub;
    existing.hasDub = mergedHasDub;
    existing.filler = existing.filler || Boolean(episode.isFiller);
    if (existing.title.startsWith('Episode ') && !title.startsWith('Episode ')) {
      existing.title = title;
      existing.jname = title;
      existing.japanese_title = title;
    }
    existing.variant =
      mergedHasSub && mergedHasDub ? 'Sub | Dub' : mergedHasDub ? 'Dub' : 'Sub';
  }

  const episodes = Array.from(episodeMap.values())
    .sort((a, b) => a.episode_no - b.episode_no)
    .map(({ hasSub: _hasSub, hasDub: _hasDub, ...item }) => item);

  const totalEpisodes =
    typeof data.totalEpisodes === 'number' && data.totalEpisodes > 0
      ? data.totalEpisodes
      : episodes.length;

  return {
    episodes,
    totalEpisodes,
  } as GetEpisodesResult;
}
