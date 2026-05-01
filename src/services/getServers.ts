import { videoApiUrl } from '@/lib/video-api';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

interface MoruroEpisode {
  episodeNumber: number | string;
  isSub?: boolean;
  isDub?: boolean;
  sub?: boolean;
  dub?: boolean;
  hasSub?: boolean;
  hasDub?: boolean;
}

interface MoruroEpisodesResponse {
  episodes?: MoruroEpisode[];
  results?: {
    episodes?: MoruroEpisode[];
  };
}

async function fetchEpisodesForServers(
  animeId: string,
  signal?: AbortSignal
): Promise<MoruroEpisodesResponse | null> {
  let lastError: unknown;
  try {
    return await videoApiUrl.get<MoruroEpisodesResponse>(
      `/api/episodes?id=${encodeURIComponent(animeId)}`,
      60,
      signal
    );
  } catch (error) {
    lastError = error;
  }
  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    lastError
  ) {
    console.warn('[getServers] episodes lookup failed, using defaults:', lastError);
  }
  return null;
}

function toEpisodeNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return Math.floor(parsed);
}

function createServerList(options: {
  hasSub: boolean;
  hasDub: boolean;
}): ServerInfo[] {
  const out: ServerInfo[] = [];
  const addPair = (type: 'sub' | 'dub', offset: number) => {
    out.push({
      type,
      data_id: offset + 1,
      server_id: 1,
      serverName: 'HD-1',
    });
    out.push({
      type,
      data_id: offset + 2,
      server_id: 2,
      serverName: 'HD-2',
    });
  };

  if (options.hasSub) addPair('sub', 0);
  if (options.hasDub) addPair('dub', 2);

  if (out.length === 0) addPair('sub', 0);
  return out;
}

function hasTrue(values: Array<boolean | undefined>): boolean {
  return values.some((value) => value === true);
}

function hasBoolean(values: Array<boolean | undefined>): boolean {
  return values.some((value) => typeof value === 'boolean');
}

function resolveEpisodeAudio(episode: MoruroEpisode | undefined): {
  hasSub: boolean | null;
  hasDub: boolean | null;
} {
  if (!episode) return { hasSub: null, hasDub: null };
  const subCandidates = [episode.isSub, episode.sub, episode.hasSub];
  const dubCandidates = [episode.isDub, episode.dub, episode.hasDub];
  const hasSubKnown = hasBoolean(subCandidates);
  const hasDubKnown = hasBoolean(dubCandidates);

  if (!hasSubKnown && !hasDubKnown) {
    return { hasSub: null, hasDub: null };
  }

  return {
    hasSub: hasTrue(subCandidates),
    hasDub: hasTrue(dubCandidates),
  };
}

function resolveCatalogAudio(episodes: MoruroEpisode[]): {
  hasSub: boolean;
  hasDub: boolean;
} {
  const anySubTrue = episodes.some((episode) =>
    hasTrue([episode.isSub, episode.sub, episode.hasSub])
  );
  const anyDubTrue = episodes.some((episode) =>
    hasTrue([episode.isDub, episode.dub, episode.hasDub])
  );

  if (!anySubTrue && !anyDubTrue) {
    return { hasSub: true, hasDub: true };
  }

  return {
    hasSub: anySubTrue || !anyDubTrue,
    hasDub: anyDubTrue,
  };
}

export async function getServers(
  animeId: string,
  episodeId: string,
  signal?: AbortSignal
): Promise<ServerInfo[]> {
  const episodeNumber = toEpisodeNumber(episodeId);
  const data = await fetchEpisodesForServers(animeId, signal);
  if (!data) {
    return createServerList({ hasSub: true, hasDub: true });
  }
  const episodes = Array.isArray(data.episodes)
    ? data.episodes
    : Array.isArray(data.results?.episodes)
      ? data.results.episodes
      : [];
  const matchedEpisode = episodes.find(
    (episode) => Number(episode.episodeNumber) === episodeNumber
  );
  const matchedAudio = resolveEpisodeAudio(matchedEpisode);
  const fallbackAudio = resolveCatalogAudio(episodes);

  return createServerList({
    hasSub: matchedAudio.hasSub ?? fallbackAudio.hasSub,
    hasDub: matchedAudio.hasDub ?? fallbackAudio.hasDub,
  });
}
