import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import {
  applyWatchCatalogSuccess,
  type ApplyWatchCatalogSuccessContext,
  type ApplyWatchCatalogSuccessOpts,
} from './applyWatchCatalogSuccess';
import {
  fetchProviderCatalogEpisodes,
  hydrateCachedProviderIds,
} from './fetchProviderCatalogEpisodes';
import { isLibertyCatalogAcceptableForAnime } from './watchAnimeCatalogUtils';
import {
  clearVerifiedLibertyMapping,
  clearVerifiedAnicoreMapping,
  getMappingCacheKey,
} from './watchAnimeMappingCache';

export interface RunWatchCatalogPipelineParams {
  watchStreamProvider: WatchStreamProvider;
  animeId: string;
  episodeRemapPass: number;
  dataForResolve: AnimeData;
  forceFuzzy: boolean;
  preserveEpisodeNum: string | null;
  settleLoading: { current: boolean };
  allowEmptyCatalogRemap: boolean;
  signal: AbortSignal;
  isAborted: () => boolean;
  applyCtx: ApplyWatchCatalogSuccessContext;
  setAnicoreCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setAnilibertyCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setHikkaCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setAnilibertyLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;
  setHikkaLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;
  setEpisodes: React.Dispatch<React.SetStateAction<EpisodesTypes[] | null>>;
  setTotalEpisodes: React.Dispatch<React.SetStateAction<number | null>>;
  setEpisodeId: React.Dispatch<React.SetStateAction<string | null>>;
  setEpisodeRemapPass: React.Dispatch<React.SetStateAction<number>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

function emptyCatalogErrorMessage(provider: WatchStreamProvider): string {
  if (provider === 'aniliberty') {
    return 'Anilibria returned an empty episode list. Refresh the page or try again later.';
  }
  if (provider === 'hikka') {
    return 'Ukrainian sources returned an empty episode list. Try another provider.';
  }
  return 'Anicore returned an empty episode list. Refresh the page or try again later.';
}

export async function runWatchCatalogPipeline(
  params: RunWatchCatalogPipelineParams
): Promise<void> {
  const {
    watchStreamProvider,
    animeId,
    episodeRemapPass,
    dataForResolve,
    forceFuzzy,
    preserveEpisodeNum,
    settleLoading,
    allowEmptyCatalogRemap,
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
  } = params;

  hydrateCachedProviderIds({
    animeId,
    forceFuzzy,
    isAborted,
    setAnicoreCatalogProviderId: (id) => setAnicoreCatalogProviderId(id),
    setAnilibertyCatalogProviderId: (id) => setAnilibertyCatalogProviderId(id),
  });

  let fetched: Awaited<ReturnType<typeof fetchProviderCatalogEpisodes>>;
  try {
    fetched = await fetchProviderCatalogEpisodes({
    watchStreamProvider,
    animeId,
    dataForResolve,
    signal,
    forceFuzzy,
    isAborted,
    });
  } catch (err) {
    if (
      watchStreamProvider === 'anicore' &&
      err instanceof Error &&
      err.message.includes('anicore_catalog_not_found')
    ) {
      clearVerifiedAnicoreMapping(animeId);
    }
    throw err;
  }

  if (isAborted()) return;

  const { providerId, episodes: list } = fetched;

  if (!list.length) {
    try {
      localStorage.removeItem(getMappingCacheKey(animeId, watchStreamProvider));
    } catch {

    }
    if (allowEmptyCatalogRemap && !forceFuzzy && episodeRemapPass === 0) {
      settleLoading.current = false;
      setEpisodeRemapPass((n) => n + 1);
      return;
    }
    setError(emptyCatalogErrorMessage(watchStreamProvider));
    setAnicoreCatalogProviderId(null);
    setAnilibertyCatalogProviderId(null);
    setHikkaCatalogProviderId(null);
    setAnilibertyLanguageMenuEligible(false);
    setHikkaLanguageMenuEligible(false);
    setEpisodes([]);
    setTotalEpisodes(0);
    setEpisodeId(null);
    return;
  }

  if (isAborted()) return;

  if (watchStreamProvider === 'aniliberty') {
    const actualCount = list.length;
    if (!isLibertyCatalogAcceptableForAnime(dataForResolve, actualCount)) {
      clearVerifiedLibertyMapping(animeId);
      setAnilibertyLanguageMenuEligible(false);
      setAnilibertyCatalogProviderId(null);
      throw new Error('aniliberty_episode_count_mismatch');
    }
    setAnilibertyLanguageMenuEligible(true);
  }

  const applyOpts: ApplyWatchCatalogSuccessOpts = {
    forceFuzzy,
    freshAnicoreCatalog: fetched.freshAnicoreCatalog,
    freshLibertyCatalog: fetched.freshLibertyCatalog,
    freshHikkaCatalog: fetched.freshHikkaCatalog,
    preserveEpisodeNum,
    settleLoading,
  };

  applyWatchCatalogSuccess(applyCtx, dataForResolve, list, providerId, applyOpts);
}
