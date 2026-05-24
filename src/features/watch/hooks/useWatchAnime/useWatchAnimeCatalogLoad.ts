import { useEffect, type MutableRefObject, type RefObject } from 'react';
import { getAnimeInfo } from '@/services/getAnimeInfo';
import { getNextEpisodeSchedule } from '@/services/getNextEpisodeSchedule';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import type { StableWatchLoadSnapshot, WarmAlternateCatalogEntry } from './types';
import type { ApplyWatchCatalogSuccessContext } from './applyWatchCatalogSuccess';
import { applyWatchCatalogSuccess } from './applyWatchCatalogSuccess';
import { getWatchAnimeErrorMessage, restoreCachedAlternateLanguageMenu } from './watchAnimeCatalogUtils';
import { runWatchCatalogPipeline } from './runWatchCatalogPipeline';

export interface WatchAnimeCatalogLoadParams {
  animeId: string;
  episodeRemapPass: number;
  watchStreamProvider: WatchStreamProvider;
  initialEpisodeRef: RefObject<string | undefined>;
  animeInfoRef: RefObject<AnimeData | null>;
  episodeIdRef: RefObject<string | null>;
  stableWatchLoad: MutableRefObject<StableWatchLoadSnapshot | null>;
  warmCatalogsRef: MutableRefObject<WarmAlternateCatalogEntry | null>;
  deferredOppositePrefetchRef: MutableRefObject<{
    animeId: string;
    data: AnimeData;
    provider: WatchStreamProvider;
  } | null>;
  oppositePrefetchDoneRef: MutableRefObject<string | null>;
  alternateWarmupAbortRef: MutableRefObject<AbortController | null>;
  setAnimeInfo: React.Dispatch<React.SetStateAction<AnimeData | null>>;
  setEpisodes: React.Dispatch<React.SetStateAction<EpisodesTypes[] | null>>;
  setAnicoreCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setAnilibertyCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setHikkaCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setTotalEpisodes: React.Dispatch<React.SetStateAction<number | null>>;
  setEpisodeId: React.Dispatch<React.SetStateAction<string | null>>;
  setAnimeInfoLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setNextEpisodeSchedule: React.Dispatch<
    React.SetStateAction<NextEpisodeScheduleResult | null>
  >;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setAnilibertyLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;
  setHikkaLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;
  setProviderCatalogPending: React.Dispatch<React.SetStateAction<boolean>>;
  setEpisodesSourceProvider: React.Dispatch<
    React.SetStateAction<WatchStreamProvider | null>
  >;
  setEpisodeRemapPass: React.Dispatch<React.SetStateAction<number>>;
}

export function useWatchAnimeCatalogLoad(params: WatchAnimeCatalogLoadParams): void {
  const {
    animeId,
    episodeRemapPass,
    watchStreamProvider,
    initialEpisodeRef,
    animeInfoRef,
    episodeIdRef,
    stableWatchLoad,
    warmCatalogsRef,
    deferredOppositePrefetchRef,
    oppositePrefetchDoneRef,
    alternateWarmupAbortRef,
    setAnimeInfo,
    setEpisodes,
    setAnicoreCatalogProviderId,
    setAnilibertyCatalogProviderId,
    setHikkaCatalogProviderId,
    setTotalEpisodes,
    setEpisodeId,
    setAnimeInfoLoading,
    setNextEpisodeSchedule,
    setError,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
    setProviderCatalogPending,
    setEpisodesSourceProvider,
    setEpisodeRemapPass,
  } = params;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let cancelled = false;
    const isAborted = () => cancelled || signal.aborted;

    const menuSetters = {
      setHikkaCatalogProviderId,
      setHikkaLanguageMenuEligible,
      setAnilibertyCatalogProviderId,
      setAnilibertyLanguageMenuEligible,
    };

    const applyCtx: ApplyWatchCatalogSuccessContext = {
      animeId,
      episodeRemapPass,
      watchStreamProvider,
      getIsCancelled: isAborted,
      initialEpisodeRef,
      stableWatchLoad,
      warmCatalogsRef,
    deferredOppositePrefetchRef,
    menuSetters,
      setAnimeInfo,
      setEpisodes,
      setAnicoreCatalogProviderId,
      setAnilibertyCatalogProviderId,
      setHikkaCatalogProviderId,
      setTotalEpisodes,
      setEpisodeId,
      setAnimeInfoLoading,
      setAnilibertyLanguageMenuEligible,
      setHikkaLanguageMenuEligible,
      setProviderCatalogPending,
      setEpisodesSourceProvider,
    };

    const s = stableWatchLoad.current;
    const providerOnly =
      s !== null &&
      s.animeId === animeId &&
      s.remap === episodeRemapPass &&
      s.provider !== watchStreamProvider;

    const runPipeline = (pipelineParams: {
      dataForResolve: AnimeData;
      forceFuzzy: boolean;
      preserveEpisodeNum: string | null;
      settleLoading: { current: boolean };
      allowEmptyCatalogRemap: boolean;
    }) =>
      runWatchCatalogPipeline({
        watchStreamProvider,
        animeId,
        episodeRemapPass,
        dataForResolve: pipelineParams.dataForResolve,
        forceFuzzy: pipelineParams.forceFuzzy,
        preserveEpisodeNum: pipelineParams.preserveEpisodeNum,
        settleLoading: pipelineParams.settleLoading,
        allowEmptyCatalogRemap: pipelineParams.allowEmptyCatalogRemap,
        signal,
        isAborted,
        applyCtx,
        setAnicoreCatalogProviderId,
        setAnilibertyCatalogProviderId,
        setHikkaCatalogProviderId,
        setAnilibertyLanguageMenuEligible,
        setHikkaLanguageMenuEligible,
        setEpisodes,
        setTotalEpisodes,
        setEpisodeId,
        setEpisodeRemapPass,
        setError,
      });

    if (providerOnly) {
      const dataForResolve = animeInfoRef.current;
      if (!dataForResolve) {
        stableWatchLoad.current = null;
        return () => {
          cancelled = true;
          controller.abort();
        };
      }

      const settleLoading = { current: false };
      setProviderCatalogPending(true);
      setError(null);
      restoreCachedAlternateLanguageMenu(animeId, watchStreamProvider, menuSetters);
      const preserveEpisodeNum = episodeIdRef.current;
      const warm = warmCatalogsRef.current;

      const applyWarmProviderSwap = (
        list: EpisodesTypes[],
        providerId: string,
        provider: 'hikka' | 'aniliberty'
      ): void => {
        if (provider === 'hikka') {
          setHikkaCatalogProviderId(providerId);
          setHikkaLanguageMenuEligible(true);
        } else {
          setAnilibertyCatalogProviderId(providerId);
          setAnilibertyLanguageMenuEligible(true);
        }
        applyWatchCatalogSuccess(applyCtx, dataForResolve, list, providerId, {
          forceFuzzy: false,
          freshAnicoreCatalog: null,
          freshLibertyCatalog: null,
          freshHikkaCatalog: null,
          preserveEpisodeNum: preserveEpisodeNum ?? null,
          settleLoading,
        });
      };

      if (
        watchStreamProvider === 'hikka' &&
        warm?.animeId === animeId &&
        warm.hikka?.slug &&
        (warm.hikka.episodes?.length ?? 0) > 0
      ) {
        applyWarmProviderSwap(warm.hikka.episodes, warm.hikka.slug, 'hikka');
        return () => {
          cancelled = true;
          controller.abort();
        };
      }

      if (
        watchStreamProvider === 'aniliberty' &&
        warm?.animeId === animeId &&
        warm.liberty?.libertyId &&
        (warm.liberty.episodes?.length ?? 0) > 0
      ) {
        applyWarmProviderSwap(
          warm.liberty.episodes,
          warm.liberty.libertyId,
          'aniliberty'
        );
        return () => {
          cancelled = true;
          controller.abort();
        };
      }

      if (watchStreamProvider === 'hikka') {
        setHikkaCatalogProviderId(null);
      } else if (watchStreamProvider === 'aniliberty') {
        setAnilibertyCatalogProviderId(null);
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
          if (isAborted()) return;
          console.warn('[useWatchAnime] provider swap catalog:', episodesError);
          setError(getWatchAnimeErrorMessage(episodesError));
          setEpisodes([]);
          setTotalEpisodes(0);
          setEpisodeId(null);
          setProviderCatalogPending(false);
        }
      })();

      return () => {
        cancelled = true;
        controller.abort();
        setProviderCatalogPending(false);
      };
    }

    setEpisodes(null);
    setAnicoreCatalogProviderId(null);
    setAnilibertyCatalogProviderId(null);
    setHikkaCatalogProviderId(null);
    if (episodeRemapPass === 0) {
      setEpisodeId(null);
      setAnimeInfo(null);
      setTotalEpisodes(null);
      setNextEpisodeSchedule(null);
    }
    setAnimeInfoLoading(true);
    setError(null);
    setAnilibertyLanguageMenuEligible(false);
    setHikkaLanguageMenuEligible(false);

    const fetchInitial = async () => {
      const settleLoading = { current: true };
      try {
        let animeData: Awaited<ReturnType<typeof getAnimeInfo>>;
        if (episodeRemapPass === 0) {
          const [info, schedule] = await Promise.all([
            getAnimeInfo(animeId),
            getNextEpisodeSchedule(animeId).catch((scheduleErr) => {
              console.error('Error fetching next episode schedule:', scheduleErr);
              return null;
            }),
          ]);
          animeData = info;
          if (!cancelled) {
            setNextEpisodeSchedule(schedule);
          }
        } else {
          animeData = await getAnimeInfo(animeId);
        }
        if (cancelled) return;
        setAnimeInfo(animeData?.data ?? null);
        const dataForResolve = animeData?.data;
        if (!dataForResolve) {
          setError('No anime data available.');
          return;
        }

        try {
          const forceFuzzy = episodeRemapPass > 0;
          await runPipeline({
            dataForResolve,
            forceFuzzy,
            preserveEpisodeNum: null,
            settleLoading,
            allowEmptyCatalogRemap: true,
          });
        } catch (episodesError) {
          if (isAborted()) return;
          console.warn('[useWatchAnime] catalog:', episodesError);
          setError(getWatchAnimeErrorMessage(episodesError));
          setAnicoreCatalogProviderId(null);
          setAnilibertyCatalogProviderId(null);
          setAnilibertyLanguageMenuEligible(false);
          setHikkaLanguageMenuEligible(false);
          setHikkaCatalogProviderId(null);
          setEpisodes([]);
          setTotalEpisodes(0);
          setEpisodeId(null);
        }
      } catch (err) {
        if (isAborted()) return;
        console.error('Error fetching initial data:', err);
        setError(getWatchAnimeErrorMessage(err));
      } finally {
        if (!cancelled && settleLoading.current) setAnimeInfoLoading(false);
      }
    };
    void fetchInitial();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    animeId,
    episodeRemapPass,
    watchStreamProvider,
    alternateWarmupAbortRef,
    animeInfoRef,
    deferredOppositePrefetchRef,
    episodeIdRef,
    initialEpisodeRef,
    oppositePrefetchDoneRef,
    setAnimeInfo,
    setAnimeInfoLoading,
    setAnicoreCatalogProviderId,
    setAnilibertyCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
    setEpisodeId,
    setEpisodeRemapPass,
    setEpisodes,
    setError,
    setHikkaCatalogProviderId,
    setHikkaLanguageMenuEligible,
    setNextEpisodeSchedule,
    setProviderCatalogPending,
    setEpisodesSourceProvider,
    setTotalEpisodes,
    stableWatchLoad,
    warmCatalogsRef,
  ]);
}
