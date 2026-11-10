import { getWatchAnimeCatalogMeta } from '@/lib/api/anime-info';
import { readVerifiedAnikotoMapping } from '@/features/watch/lib/provider-mapping-cache';
import { readWatchCatalogSessionCache } from '@/features/watch/lib/watch-catalog-session-cache';
import { getWatchAnimeErrorMessage } from './watchAnimeCatalogUtils';
import { ANIKOTO_PLAYBACK_ENABLED } from '@/features/watch/lib/watch-provider';
import { prefetchAnikotoMapping } from './watchAnimePrefetch';
import type { WatchAnimeCatalogLoadParams } from './watchAnimeCatalogLoadTypes';
import type { WatchCatalogLoadEffectDeps } from './watchCatalogLoadDeps';

export interface InitialWatchCatalogLoadInput {
  deps: WatchCatalogLoadEffectDeps;
  episodeRemapPass: number;
  setAnimeInfo: WatchAnimeCatalogLoadParams['setAnimeInfo'];
  setEpisodes: WatchAnimeCatalogLoadParams['setEpisodes'];
  setHikkaCatalogProviderId: WatchAnimeCatalogLoadParams['setHikkaCatalogProviderId'];
  setTotalEpisodes: WatchAnimeCatalogLoadParams['setTotalEpisodes'];
  setEpisodeId: WatchAnimeCatalogLoadParams['setEpisodeId'];
  setAnimeInfoLoading: WatchAnimeCatalogLoadParams['setAnimeInfoLoading'];
  setNextEpisodeSchedule: WatchAnimeCatalogLoadParams['setNextEpisodeSchedule'];
  setProviderCatalogPending: WatchAnimeCatalogLoadParams['setProviderCatalogPending'];
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
    setHikkaCatalogProviderId,
    setTotalEpisodes,
    setEpisodeId,
    setAnimeInfoLoading,
    setNextEpisodeSchedule,
    setProviderCatalogPending,
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
  setHikkaLanguageMenuEligible(false);
  setAnikotoLanguageMenuEligible(false);

  const cachedAnikoto = readVerifiedAnikotoMapping(animeId);
  if (cachedAnikoto?.anikotoSlug) {
    setAnikotoCatalogProviderId(cachedAnikoto.anikotoSlug);
    if (ANIKOTO_PLAYBACK_ENABLED) {
      setAnikotoLanguageMenuEligible(true);
    }
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

      if (ANIKOTO_PLAYBACK_ENABLED && deps.watchStreamProvider !== 'anikoto') {
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
