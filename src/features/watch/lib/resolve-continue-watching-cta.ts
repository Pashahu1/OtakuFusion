import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';
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

export function findContinueWatchingEntry(
  list: ContinueWatchingEntry[],
  animeId: string,
  dataId?: number,
): ContinueWatchingEntry | undefined {
  return list.find(
    (item) =>
      item.id === animeId ||
      (dataId != null && Number.isFinite(dataId) && item.data_id === dataId),
  );
}

function episodeNumFromEntry(entry: ContinueWatchingEntry): string {
  if (entry.episodeNum != null && Number.isFinite(entry.episodeNum)) {
    return String(entry.episodeNum);
  }
  return getEpisodeNumberFromId(entry.episodeId) ?? entry.episodeId;
}

function episodeNumFromCatalog(ep: EpisodeRef): string {
  return getEpisodeNumberFromId(ep.id) ?? String(ep.episode_no);
}

/** Episode for play CTA: URL override → continueWatching → first unwatched → last in list → 1. */
export function pickContinueEpisodeNumber(
  urlEp: string | undefined,
  continueEntry: ContinueWatchingEntry | undefined,
  watched: Record<string, boolean>,
  episodes: EpisodeRef[] | null,
): string {
  const fromUrl = urlEp?.trim();
  if (fromUrl) return fromUrl;

  if (continueEntry) {
    const ep = episodeNumFromEntry(continueEntry);
    if (!episodes?.length) return ep;
    const exists = episodes.some((item) => episodeNumFromCatalog(item) === ep);
    if (exists) return ep;
  }

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

export function hasWatchProgress(
  continueEntry: ContinueWatchingEntry | undefined,
  watched: Record<string, boolean>,
): boolean {
  if (continueEntry) return true;
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
    ctaLabel: isContinue
      ? `Continue Watching E${episodeNum}`
      : `Start Watching E${episodeNum}`,
    variant: isContinue ? 'continue' : 'watch',
  };
}

export function resolveWatchCtaModel(params: {
  animeId: string;
  dataId?: number;
  urlEp?: string;
  continueList: ContinueWatchingEntry[];
  watched: Record<string, boolean>;
  episodes: EpisodeRef[] | null;
}): WatchCtaModel {
  const continueEntry = findContinueWatchingEntry(
    params.continueList,
    params.animeId,
    params.dataId,
  );
  const episodeNum = pickContinueEpisodeNumber(
    params.urlEp,
    continueEntry,
    params.watched,
    params.episodes,
  );
  const isContinue = hasWatchProgress(continueEntry, params.watched);
  return buildWatchCtaModel(params.animeId, episodeNum, isContinue);
}
