import type { MutableRefObject, RefObject } from 'react';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { readVerifiedLibertyMapping } from '@/features/watch/lib/provider-mapping-cache';
import type { ApplyWatchCatalogSuccessContext } from './applyWatchCatalogSuccess';
import { applyWatchCatalogSuccess } from './applyWatchCatalogSuccess';
import {
  fetchAnilibertyEpisodesForProviderSwap,
  trySyncAnilibertyProviderSwap,
} from './anilibertyProviderSwap';
import { getWatchAnimeErrorMessage, restoreCachedAlternateLanguageMenu } from './watchAnimeCatalogUtils';
import type { StableWatchLoadSnapshot, WarmAlternateCatalogEntry } from './types';
import type { WatchAnimeCatalogLoadParams } from './watchAnimeCatalogLoadTypes';
import type { WatchCatalogLoadEffectDeps } from './watchCatalogLoadDeps';

export interface ProviderOnlyCatalogLoadInput {
  deps: WatchCatalogLoadEffectDeps;
  animeInfoRef: RefObject<AnimeData | null>;
  episodeIdRef: RefObject<string | null>;
  stableWatchLoad: MutableRefObject<StableWatchLoadSnapshot | null>;
  warmCatalogsRef: MutableRefObject<WarmAlternateCatalogEntry | null>;
  setProviderCatalogPending: WatchAnimeCatalogLoadParams['setProviderCatalogPending'];
  markCancelled: () => void;
  abortSignal: () => void;
}

function reportProviderSwapCatalogError(
  episodesError: unknown,
  isAborted: () => boolean,
  setError: WatchAnimeCatalogLoadParams['setError'],
  setEpisodes: WatchAnimeCatalogLoadParams['setEpisodes'],
  setTotalEpisodes: WatchAnimeCatalogLoadParams['setTotalEpisodes'],
  setEpisodeId: WatchAnimeCatalogLoadParams['setEpisodeId'],
  setProviderCatalogPending: WatchAnimeCatalogLoadParams['setProviderCatalogPending']
): void {
  if (isAborted()) return;
  console.warn('[useWatchAnime] provider swap catalog:', episodesError);
  setError(getWatchAnimeErrorMessage(episodesError));
  setEpisodes([]);
  setTotalEpisodes(0);
  setEpisodeId(null);
  setProviderCatalogPending(false);
}

function applyWarmProviderSwap(
  applyCtx: ApplyWatchCatalogSuccessContext,
  dataForResolve: AnimeData,
  list: EpisodesTypes[],
  providerId: string,
  provider: 'hikka' | 'aniliberty',
  preserveEpisodeNum: string | null,
  setHikkaCatalogProviderId: WatchAnimeCatalogLoadParams['setHikkaCatalogProviderId'],
  setHikkaLanguageMenuEligible: WatchAnimeCatalogLoadParams['setHikkaLanguageMenuEligible'],
  setAnilibertyCatalogProviderId: WatchAnimeCatalogLoadParams['setAnilibertyCatalogProviderId'],
  setAnilibertyLanguageMenuEligible: WatchAnimeCatalogLoadParams['setAnilibertyLanguageMenuEligible']
): void {
  if (provider === 'hikka') {
    setHikkaCatalogProviderId(providerId);
    setHikkaLanguageMenuEligible(true);
  } else {
    setAnilibertyCatalogProviderId(providerId);
    setAnilibertyLanguageMenuEligible(true);
  }
  applyWatchCatalogSuccess(applyCtx, dataForResolve, list, providerId, {
    forceFuzzy: false,
    freshPaheCatalog: null,
    freshLibertyCatalog: null,
    freshHikkaCatalog: null,
    preserveEpisodeNum,
    settleLoading: { current: false },
  });
}

function makeProviderSwapCleanup(
  input: ProviderOnlyCatalogLoadInput
): () => void {
  const { markCancelled, abortSignal, setProviderCatalogPending } = input;
  return () => {
    markCancelled();
    abortSignal();
    setProviderCatalogPending(false);
  };
}

/** Cleanup for effect when only provider changes (no full page reload). */
export function runProviderOnlyCatalogLoad(
  input: ProviderOnlyCatalogLoadInput
): () => void {
  const {
    deps,
    animeInfoRef,
    episodeIdRef,
    stableWatchLoad,
    warmCatalogsRef,
    setProviderCatalogPending,
  } = input;
  const {
    animeId,
    watchStreamProvider,
    signal,
    isAborted,
    applyCtx,
    menuSetters,
    runPipeline,
    setHikkaCatalogProviderId,
    setAnilibertyCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
    setEpisodes,
    setTotalEpisodes,
    setEpisodeId,
    setError,
  } = deps;

  const dataForResolve = animeInfoRef.current;
  if (!dataForResolve) {
    stableWatchLoad.current = null;
    return () => {
      input.markCancelled();
      input.abortSignal();
    };
  }

  const settleLoading = { current: false };
  setProviderCatalogPending(true);
  setError(null);
  restoreCachedAlternateLanguageMenu(animeId, watchStreamProvider, menuSetters);
  const preserveEpisodeNum = episodeIdRef.current;
  const warm = warmCatalogsRef.current;

  if (
    watchStreamProvider === 'hikka' &&
    warm?.animeId === animeId &&
    warm.hikka?.slug &&
    (warm.hikka.episodes?.length ?? 0) > 0
  ) {
    applyWarmProviderSwap(
      applyCtx,
      dataForResolve,
      warm.hikka.episodes,
      warm.hikka.slug,
      'hikka',
      preserveEpisodeNum ?? null,
      setHikkaCatalogProviderId,
      setHikkaLanguageMenuEligible,
      setAnilibertyCatalogProviderId,
      setAnilibertyLanguageMenuEligible
    );
    return () => {
      input.markCancelled();
      input.abortSignal();
    };
  }

  if (watchStreamProvider === 'aniliberty') {
    if (
      trySyncAnilibertyProviderSwap({
        animeId,
        dataForResolve,
        warm,
        preserveEpisodeNum: preserveEpisodeNum ?? null,
        applyCtx,
        warmCatalogsRef,
        setAnilibertyCatalogProviderId,
        setAnilibertyLanguageMenuEligible,
      })
    ) {
      return () => {
        input.markCancelled();
        input.abortSignal();
      };
    }

    restoreCachedAlternateLanguageMenu(animeId, 'aniliberty', menuSetters);
    const cachedLiberty = readVerifiedLibertyMapping(animeId);

    void (async () => {
      try {
        if (cachedLiberty?.libertyId) {
          const episodesOnly = await fetchAnilibertyEpisodesForProviderSwap({
            animeId,
            libertyId: cachedLiberty.libertyId,
            dataForResolve,
            signal,
            isAborted,
          });
          if (isAborted()) return;
          if (episodesOnly?.length) {
            if (
              trySyncAnilibertyProviderSwap({
                animeId,
                dataForResolve,
                warm: {
                  animeId,
                  liberty: {
                    libertyId: cachedLiberty.libertyId,
                    episodes: episodesOnly,
                  },
                },
                preserveEpisodeNum: preserveEpisodeNum ?? null,
                applyCtx,
                warmCatalogsRef,
                setAnilibertyCatalogProviderId,
                setAnilibertyLanguageMenuEligible,
              })
            ) {
              return;
            }
          }
        }

        await runPipeline({
          dataForResolve,
          forceFuzzy: false,
          preserveEpisodeNum: preserveEpisodeNum ?? null,
          settleLoading,
          allowEmptyCatalogRemap: false,
        });
      } catch (episodesError) {
        reportProviderSwapCatalogError(
          episodesError,
          isAborted,
          setError,
          setEpisodes,
          setTotalEpisodes,
          setEpisodeId,
          setProviderCatalogPending
        );
      }
    })();

    return makeProviderSwapCleanup(input);
  }

  if (watchStreamProvider === 'hikka') {
    setHikkaCatalogProviderId(null);
  }

  void (async () => {
    try {
      await runPipeline({
        dataForResolve,
        forceFuzzy: false,
        preserveEpisodeNum: preserveEpisodeNum ?? null,
        settleLoading,
        allowEmptyCatalogRemap: false,
      });
    } catch (episodesError) {
      reportProviderSwapCatalogError(
        episodesError,
        isAborted,
        setError,
        setEpisodes,
        setTotalEpisodes,
        setEpisodeId,
        setProviderCatalogPending
      );
    }
  })();

  return makeProviderSwapCleanup(input);
}
