import { getWatchAnimeCatalogMeta } from '@/lib/api/anime-info';

import { readVerifiedAnikotoMapping } from '@/features/watch/lib/provider-mapping-cache';

import { readWatchCatalogSessionCache } from '@/features/watch/lib/watch-catalog-session-cache';

import { getWatchAnimeErrorMessage } from './watchAnimeCatalogUtils';

import { prefetchAnikotoMapping } from './watchAnimePrefetch';

import type { WatchAnimeCatalogLoadParams } from './watchAnimeCatalogLoadTypes';

import type { WatchCatalogLoadEffectDeps } from './watchCatalogLoadDeps';



export interface InitialWatchCatalogLoadInput {

  deps: WatchCatalogLoadEffectDeps;

  episodeRemapPass: number;

  setAnimeInfo: WatchAnimeCatalogLoadParams['setAnimeInfo'];

  setEpisodes: WatchAnimeCatalogLoadParams['setEpisodes'];

  setAnilibertyCatalogProviderId: WatchAnimeCatalogLoadParams['setAnilibertyCatalogProviderId'];

  setHikkaCatalogProviderId: WatchAnimeCatalogLoadParams['setHikkaCatalogProviderId'];

  setTotalEpisodes: WatchAnimeCatalogLoadParams['setTotalEpisodes'];

  setEpisodeId: WatchAnimeCatalogLoadParams['setEpisodeId'];

  setAnimeInfoLoading: WatchAnimeCatalogLoadParams['setAnimeInfoLoading'];

  setNextEpisodeSchedule: WatchAnimeCatalogLoadParams['setNextEpisodeSchedule'];

  setProviderCatalogPending: WatchAnimeCatalogLoadParams['setProviderCatalogPending'];

  setAnilibertyLanguageMenuEligible: WatchAnimeCatalogLoadParams['setAnilibertyLanguageMenuEligible'];

  setHikkaLanguageMenuEligible: WatchAnimeCatalogLoadParams['setHikkaLanguageMenuEligible'];

  setAnikotoLanguageMenuEligible: WatchAnimeCatalogLoadParams['setAnikotoLanguageMenuEligible'];

  setAnikotoCatalogProviderId: WatchAnimeCatalogLoadParams['setAnikotoCatalogProviderId'];

  isCancelled: () => boolean;

  markCancelled: () => void;

  abortSignal: () => void;

}



export function runInitialWatchCatalogLoad(input: InitialWatchCatalogLoadInput): () => void {

  const {

    deps,

    episodeRemapPass,

    setAnimeInfo,

    setEpisodes,

    setAnilibertyCatalogProviderId,

    setHikkaCatalogProviderId,

    setTotalEpisodes,

    setEpisodeId,

    setAnimeInfoLoading,

    setNextEpisodeSchedule,

    setProviderCatalogPending,

    setAnilibertyLanguageMenuEligible,

    setHikkaLanguageMenuEligible,

    setAnikotoLanguageMenuEligible,

    setAnikotoCatalogProviderId,

    isCancelled,

  } = input;

  const {

    animeId,

    isAborted,

    signal,

    runPipeline,

    setError,

    setAnilibertyLanguageMenuEligible: setAnilibertyEligible,

    setHikkaLanguageMenuEligible: setHikkaEligible,

  } = deps;



  const sessionCached =

    episodeRemapPass === 0

      ? readWatchCatalogSessionCache(animeId, deps.watchStreamProvider)

      : null;

  if (sessionCached) {

    return () => {

      input.markCancelled();

      input.abortSignal();

    };

  }



  setEpisodes(null);

  setAnilibertyCatalogProviderId(null);

  setHikkaCatalogProviderId(null);

  if (episodeRemapPass === 0) {

    setEpisodeId(null);

    setAnimeInfo(null);

    setTotalEpisodes(null);

    setNextEpisodeSchedule(null);

  }

  setAnimeInfoLoading(true);

  setProviderCatalogPending(true);

  setError(null);

  setAnilibertyLanguageMenuEligible(false);

  setHikkaLanguageMenuEligible(false);

  setAnikotoLanguageMenuEligible(false);



  const cachedAnikoto = readVerifiedAnikotoMapping(animeId);

  if (cachedAnikoto?.anikotoSlug) {

    setAnikotoCatalogProviderId(cachedAnikoto.anikotoSlug);

    setAnikotoLanguageMenuEligible(true);

  }



  const fetchInitial = async () => {

    const settleLoading = { current: true };

    try {

      const catalogMeta = await getWatchAnimeCatalogMeta(animeId);

      if (isCancelled()) return;

      if (episodeRemapPass === 0) {

        setNextEpisodeSchedule(catalogMeta.nextEpisodeSchedule);

      }

      const animeData = catalogMeta.results;

      setAnimeInfo(animeData?.data ?? null);

      const dataForResolve = animeData?.data;

      if (!dataForResolve) {

        setError('No anime data available.');

        return;

      }



      if (deps.watchStreamProvider !== 'anikoto') {
        prefetchAnikotoMapping(dataForResolve, animeId, signal, isCancelled, () => {
          if (!isCancelled()) {
            setAnikotoLanguageMenuEligible(true);
          }
        });
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

        setAnilibertyCatalogProviderId(null);

        setAnilibertyEligible(false);

        setHikkaEligible(false);

        setHikkaCatalogProviderId(null);

        setAnikotoLanguageMenuEligible(false);

        setAnikotoCatalogProviderId(null);

        setEpisodes([]);

        setTotalEpisodes(0);

        setEpisodeId(null);

        setProviderCatalogPending(false);

      }

    } catch (err) {

      if (isAborted()) return;

      console.error('Error fetching initial data:', err);

      setError(getWatchAnimeErrorMessage(err));

      setProviderCatalogPending(false);

    } finally {

      if (!isCancelled() && settleLoading.current) setAnimeInfoLoading(false);

    }

  };



  void fetchInitial();



  return () => {

    input.markCancelled();

    input.abortSignal();

    setProviderCatalogPending(false);

  };

}

