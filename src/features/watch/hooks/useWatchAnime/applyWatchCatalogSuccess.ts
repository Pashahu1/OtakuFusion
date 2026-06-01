import { alignEpisodesToAnilistSeasonStart } from '@/features/watch/lib/alignEpisodesToAnilistSeason';
import { aggregateTvInfoStreamCounts } from '@/shared/utils/catalogStreamCounts';
import { applyAnilistEpisodeDisplayTitles } from '@/features/watch/lib/anilistEpisodeDisplayTitles';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import {
  readVerifiedPaheMapping,
  writeLibertyEpisodesCache,
} from '@/features/watch/lib/provider-mapping-cache';
import { upsertWarmHikkaCatalog, upsertWarmLibertyCatalog } from './watchAnimeWarmCatalog';
import { resolveEpisodeIdAfterCatalog } from './resolveEpisodeIdAfterCatalog';
import { applyProviderCatalogState } from './apply-watch-catalog/applyProviderCatalogState';
import type {
  ApplyWatchCatalogSuccessContext,
  ApplyWatchCatalogSuccessOpts,
} from './apply-watch-catalog/applyWatchCatalogSuccessTypes';

export type {
  ApplyWatchCatalogSuccessContext,
  ApplyWatchCatalogSuccessOpts,
} from './apply-watch-catalog/applyWatchCatalogSuccessTypes';

export function applyWatchCatalogSuccess(
  ctx: ApplyWatchCatalogSuccessContext,
  dataForResolve: AnimeData,
  list: EpisodesTypes[],
  providerId: string,
  opts: ApplyWatchCatalogSuccessOpts,
): void {
  const {
    animeId,
    episodeRemapPass,
    watchStreamProvider,
    getIsCancelled,
    initialEpisodeRef,
    stableWatchLoadRef,
    warmCatalogsRef,
    deferredOppositePrefetchRef,
    setAnimeInfo,
    setEpisodes,
    setTotalEpisodes,
    setEpisodeId,
    setAnimeInfoLoading,
    setProviderCatalogPending,
    setEpisodesSourceProvider,
  } = ctx;

  const { forceFuzzy, freshPaheCatalog, preserveEpisodeNum, settleLoading } = opts;

  applyProviderCatalogState(ctx, providerId, opts);

  if (!forceFuzzy) {
    deferredOppositePrefetchRef.current = {
      animeId,
      data: dataForResolve,
      provider: watchStreamProvider,
    };
  }

  const mergedEpisodes = applyAnilistEpisodeDisplayTitles(
    alignEpisodesToAnilistSeasonStart(list, dataForResolve.anilistEpisodeTitles),
    dataForResolve.anilistEpisodeTitles,
    dataForResolve.title,
    dataForResolve.romaji_title,
  );

  setEpisodes(mergedEpisodes);
  setEpisodesSourceProvider(watchStreamProvider);
  setTotalEpisodes(mergedEpisodes.length > 0 ? mergedEpisodes.length : null);

  const seriesDubHint =
    watchStreamProvider === 'animepahe' &&
    (freshPaheCatalog?.hasSeriesDub === true ||
      readVerifiedPaheMapping(animeId)?.hasSeriesDub === true);
  if (watchStreamProvider === 'animepahe') {
    const counts = aggregateTvInfoStreamCounts(mergedEpisodes, {
      provider: 'animepahe',
      seriesDubHint,
    });
    setAnimeInfo((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        animeInfo: {
          ...prev.animeInfo,
          tvInfo: {
            ...prev.animeInfo.tvInfo,
            has_sub: counts.has_sub,
            has_dub: counts.has_dub,
          },
        },
      };
    });
  }

  setEpisodeId(
    resolveEpisodeIdAfterCatalog(
      mergedEpisodes,
      preserveEpisodeNum,
      initialEpisodeRef.current,
    ),
  );

  if (!getIsCancelled() && mergedEpisodes.length > 0) {
    if (watchStreamProvider === 'aniliberty') {
      upsertWarmLibertyCatalog(warmCatalogsRef, animeId, providerId, mergedEpisodes);
      writeLibertyEpisodesCache(
        animeId,
        providerId,
        mergedEpisodes,
        mergedEpisodes.length,
      );
    } else if (watchStreamProvider === 'hikka') {
      upsertWarmHikkaCatalog(warmCatalogsRef, animeId, providerId, mergedEpisodes);
    }
  }

  stableWatchLoadRef.current = {
    animeId,
    remap: episodeRemapPass,
    provider: watchStreamProvider,
  };

  if (!getIsCancelled() && settleLoading.current) setAnimeInfoLoading(false);

  if (!getIsCancelled()) {
    setProviderCatalogPending(false);
  }
}
