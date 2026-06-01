import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { watchPlayPath } from '@/shared/utils/watch-routes';

export interface WatchCtaModel {
  episodeNum: string;
  playHref: string;
  ctaLabel: string;
}

export interface EpisodeRef {
  id: string;
  episode_no: number;
}

function episodeNumFromCatalog(ep: EpisodeRef): string {
  return getEpisodeNumberFromId(ep.id) ?? String(ep.episode_no);
}

/** Episode for play CTA: URL override → first in catalog → 1. */
export function pickWatchEpisodeNumber(
  urlEp: string | undefined,
  episodes: EpisodeRef[] | null,
): string {
  const fromUrl = urlEp?.trim();
  if (fromUrl) return fromUrl;

  if (episodes?.length) {
    return episodeNumFromCatalog(episodes[0]);
  }

  return '1';
}

export function buildWatchCtaModel(animeId: string, episodeNum: string): WatchCtaModel {
  return {
    episodeNum,
    playHref: watchPlayPath(animeId, episodeNum),
    ctaLabel: 'Watch Now',
  };
}

export function resolveWatchCtaModel(params: {
  animeId: string;
  urlEp?: string;
  episodes: EpisodeRef[] | null;
}): WatchCtaModel {
  const episodeNum = pickWatchEpisodeNumber(params.urlEp, params.episodes);
  return buildWatchCtaModel(params.animeId, episodeNum);
}
