import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import { STALE_TIME } from '@/lib/query/stale-time';
import type {
  StableWatchLoadSnapshot,
  WarmAlternateCatalogEntry,
} from '@/features/watch/hooks/useWatchAnime/types';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

const WATCH_CATALOG_SESSION_TTL_MS = STALE_TIME.animeInfo;

export interface WatchCatalogSessionSnapshot {
  animeId: string;
  watchStreamProvider: WatchStreamProvider;
  cachedAt: number;
  animeInfo: AnimeData;
  episodes: EpisodesTypes[];
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  anilibertyCatalogProviderId: string | null;
  hikkaCatalogProviderId: string | null;
  totalEpisodes: number | null;
  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
  episodesSourceProvider: WatchStreamProvider | null;
  stableWatchLoad: StableWatchLoadSnapshot;
  warmCatalogs: WarmAlternateCatalogEntry | null;
}

function cacheKey(animeId: string, provider: WatchStreamProvider): string {
  return `${animeId.trim()}::${provider}`;
}

const store = new Map<string, WatchCatalogSessionSnapshot>();

function isFresh(snapshot: WatchCatalogSessionSnapshot): boolean {
  return Date.now() - snapshot.cachedAt < WATCH_CATALOG_SESSION_TTL_MS;
}

export function readWatchCatalogSessionCache(
  animeId: string,
  watchStreamProvider: WatchStreamProvider
): WatchCatalogSessionSnapshot | null {
  const id = animeId.trim();
  if (!id) return null;
  const entry = store.get(cacheKey(id, watchStreamProvider));
  if (!entry || entry.animeId !== id || entry.watchStreamProvider !== watchStreamProvider) {
    return null;
  }
  if (!isFresh(entry)) {
    store.delete(cacheKey(id, watchStreamProvider));
    return null;
  }
  return entry;
}

export function writeWatchCatalogSessionCache(snapshot: WatchCatalogSessionSnapshot): void {
  const id = snapshot.animeId.trim();
  if (!id || snapshot.episodes.length === 0) return;
  store.set(cacheKey(id, snapshot.watchStreamProvider), {
    ...snapshot,
    animeId: id,
    cachedAt: Date.now(),
  });
}
