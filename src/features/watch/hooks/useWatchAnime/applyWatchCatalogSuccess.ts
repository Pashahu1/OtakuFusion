import type { AnimepaheCatalogBffOk } from '@/lib/bff/watch/animepahe-catalog';
import type { AnilibertyCatalogBffOk } from '@/lib/bff/watch/aniliberty-catalog';
import type { HikkaCatalogBffOk } from '@/lib/bff/watch/hikka-catalog';
import { alignEpisodesToAnilistSeasonStart } from '@/features/watch/lib/alignEpisodesToAnilistSeason';
import { aggregateTvInfoStreamCounts } from '@/shared/utils/catalogStreamCounts';
import { resolveEpisodeIdAfterCatalog } from './resolveEpisodeIdAfterCatalog';
import { applyAnilistEpisodeDisplayTitles } from '@/features/watch/lib/anilistEpisodeDisplayTitles';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { AlternateLanguageMenuSetters, StableWatchLoadSnapshot, WarmAlternateCatalogEntry } from './types';
import { restoreCachedAlternateLanguageMenu } from './watchAnimeCatalogUtils';
import {
  readVerifiedHikkaMapping,
  readVerifiedLibertyMapping,
  readVerifiedPaheMapping,
  writeLibertyEpisodesCache,
  writeVerifiedHikkaMapping,
  writeVerifiedLibertyMapping,
  writeVerifiedPaheMapping,
} from '@/features/watch/lib/provider-mapping-cache';
import { upsertWarmHikkaCatalog, upsertWarmLibertyCatalog } from './watchAnimeWarmCatalog';

export interface ApplyWatchCatalogSuccessContext {
  animeId: string;
  episodeRemapPass: number;
  watchStreamProvider: WatchStreamProvider;
  getIsCancelled: () => boolean;
  initialEpisodeRef: React.RefObject<string | undefined>;
  stableWatchLoad: React.MutableRefObject<StableWatchLoadSnapshot | null>;
  warmCatalogsRef: React.MutableRefObject<WarmAlternateCatalogEntry | null>;
  deferredOppositePrefetchRef: React.MutableRefObject<{
    animeId: string;
    data: AnimeData;
    provider: WatchStreamProvider;
  } | null>;
  menuSetters: AlternateLanguageMenuSetters;
  setAnimeInfo: React.Dispatch<React.SetStateAction<AnimeData | null>>;
  setEpisodes: React.Dispatch<React.SetStateAction<EpisodesTypes[] | null>>;
  setAnimepaheCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setAnilibertyCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setHikkaCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setTotalEpisodes: React.Dispatch<React.SetStateAction<number | null>>;
  setEpisodeId: React.Dispatch<React.SetStateAction<string | null>>;
  setAnimeInfoLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setAnilibertyLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;
  setHikkaLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;
  setProviderCatalogPending: React.Dispatch<React.SetStateAction<boolean>>;
  setEpisodesSourceProvider: React.Dispatch<
    React.SetStateAction<WatchStreamProvider | null>
  >;
}

export interface ApplyWatchCatalogSuccessOpts {
  forceFuzzy: boolean;
  freshPaheCatalog: AnimepaheCatalogBffOk | null;
  freshLibertyCatalog: AnilibertyCatalogBffOk | null;
  freshHikkaCatalog: HikkaCatalogBffOk | null;
  preserveEpisodeNum: string | null;
  settleLoading: { current: boolean };
}

export function applyWatchCatalogSuccess(
  ctx: ApplyWatchCatalogSuccessContext,
  dataForResolve: AnimeData,
  list: EpisodesTypes[],
  providerId: string,
  opts: ApplyWatchCatalogSuccessOpts
): void {
  const {
    animeId,
    episodeRemapPass,
    watchStreamProvider,
    getIsCancelled,
    initialEpisodeRef,
    stableWatchLoad,
    warmCatalogsRef,
    deferredOppositePrefetchRef,
    menuSetters,
    setAnimeInfo,
    setEpisodes,
    setAnimepaheCatalogProviderId,
    setAnilibertyCatalogProviderId,
    setHikkaCatalogProviderId,
    setTotalEpisodes,
    setEpisodeId,
    setAnimeInfoLoading,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
    setProviderCatalogPending,
    setEpisodesSourceProvider,
  } = ctx;

  const {
    forceFuzzy,
    freshPaheCatalog,
    freshLibertyCatalog,
    freshHikkaCatalog,
    preserveEpisodeNum,
    settleLoading,
  } = opts;

  if (watchStreamProvider === 'aniliberty') {
    if (freshLibertyCatalog) {
      writeVerifiedLibertyMapping(animeId, providerId);
    }
    setAnilibertyCatalogProviderId(providerId);
    setAnilibertyLanguageMenuEligible(true);
    if (!forceFuzzy) {
      restoreCachedAlternateLanguageMenu(animeId, 'aniliberty', menuSetters);
    }
  } else if (watchStreamProvider === 'hikka') {
    if (freshHikkaCatalog) {
      writeVerifiedHikkaMapping(animeId, providerId);
    }
    setHikkaCatalogProviderId(providerId);
    setHikkaLanguageMenuEligible(true);
    if (!forceFuzzy) {
      restoreCachedAlternateLanguageMenu(animeId, 'hikka', menuSetters);
    }
  } else {
    if (freshPaheCatalog) {
      writeVerifiedPaheMapping(animeId, providerId, freshPaheCatalog.hasSeriesDub === true);
    }
    setAnimepaheCatalogProviderId(providerId);
    if (!forceFuzzy) {
      const cachedHikka = readVerifiedHikkaMapping(animeId);
      const cachedLiberty = readVerifiedLibertyMapping(animeId);
      if (cachedHikka?.hikkaSlug) {
        setHikkaCatalogProviderId(cachedHikka.hikkaSlug);
        setHikkaLanguageMenuEligible(true);
      }
      if (cachedLiberty?.libertyId) {
        setAnilibertyCatalogProviderId(cachedLiberty.libertyId);
        setAnilibertyLanguageMenuEligible(true);
      }

    }
  }

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
    dataForResolve.romaji_title
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
      initialEpisodeRef.current
    )
  );

  if (!getIsCancelled() && mergedEpisodes.length > 0) {
    if (watchStreamProvider === 'aniliberty') {
      upsertWarmLibertyCatalog(warmCatalogsRef, animeId, providerId, mergedEpisodes);
      writeLibertyEpisodesCache(
        animeId,
        providerId,
        mergedEpisodes,
        mergedEpisodes.length
      );
    } else if (watchStreamProvider === 'hikka') {
      upsertWarmHikkaCatalog(warmCatalogsRef, animeId, providerId, mergedEpisodes);
    }
  }

  stableWatchLoad.current = {
    animeId,
    remap: episodeRemapPass,
    provider: watchStreamProvider,
  };

  if (!getIsCancelled() && settleLoading.current) setAnimeInfoLoading(false);

  if (!getIsCancelled()) {
    setProviderCatalogPending(false);
  }
}
