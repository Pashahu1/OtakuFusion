import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { watchPlayPath } from '@/shared/utils/watch-routes';

export type WatchCtaVariant = 'watch' | 'continue';

export interface WatchCtaModel {
  episodeNum: string;
  playHref: string;
  ctaLabel: string;
  variant: WatchCtaVariant;
}

export interface EpisodeRef {
  id: string;
  episode_no: number;
}

function episodeNumFromCatalog(ep: EpisodeRef): string {
  return getEpisodeNumberFromId(ep.id) ?? String(ep.episode_no);
}

/** Episode for play CTA: URL override → first unwatched → last in list → 1. */
export function pickWatchEpisodeNumber(
  urlEp: string | undefined,
  watched: Record<string, boolean>,
  episodes: EpisodeRef[] | null,
): string {
  const fromUrl = urlEp?.trim();
  if (fromUrl) return fromUrl;

  if (episodes?.length) {
    const firstUnwatched = episodes.find((item) => {
      const num = episodeNumFromCatalog(item);
      return !watched[num];
    });
    if (firstUnwatched) return episodeNumFromCatalog(firstUnwatched);

    const last = episodes[episodes.length - 1];
    return episodeNumFromCatalog(last);
  }

  return '1';
}

export function hasWatchProgress(watched: Record<string, boolean>): boolean {
  return Object.values(watched).some(Boolean);
}

export function buildWatchCtaModel(
  animeId: string,
  episodeNum: string,
  isContinue: boolean,
): WatchCtaModel {
  return {
    episodeNum,
    playHref: watchPlayPath(animeId, episodeNum),
    ctaLabel: isContinue ? `Continue Watching E${episodeNum}` : 'Watch Now',
    variant: isContinue ? 'continue' : 'watch',
  };
}

export function resolveWatchCtaModel(params: {
  animeId: string;
  urlEp?: string;
  watched: Record<string, boolean>;
  episodes: EpisodeRef[] | null;
}): WatchCtaModel {
  const episodeNum = pickWatchEpisodeNumber(params.urlEp, params.watched, params.episodes);
  const isContinue = hasWatchProgress(params.watched);
  return buildWatchCtaModel(params.animeId, episodeNum, isContinue);
}
