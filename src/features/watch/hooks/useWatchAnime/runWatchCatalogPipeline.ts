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
import {
  ANIKOTO_MAPPING_KEY,
  getMappingCacheKey,
} from '@/features/watch/lib/provider-mapping-cache';

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
  setHikkaCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setAnikotoCatalogProviderId: React.Dispatch<React.SetStateAction<string | null>>;
  setHikkaLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;
  setAnikotoLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;
  setEpisodes: React.Dispatch<React.SetStateAction<EpisodesTypes[] | null>>;
  setTotalEpisodes: React.Dispatch<React.SetStateAction<number | null>>;
  setEpisodeId: React.Dispatch<React.SetStateAction<string | null>>;
  setEpisodeRemapPass: React.Dispatch<React.SetStateAction<number>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

function emptyCatalogErrorMessage(provider: WatchStreamProvider): string {
  if (provider === 'hikka') {
    return 'Ukrainian sources returned an empty episode list. Try another provider.';
  }
  return 'English sources returned an empty episode list. Try another provider.';
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
    setHikkaCatalogProviderId,
    setAnikotoCatalogProviderId,
    setHikkaLanguageMenuEligible,
    setAnikotoLanguageMenuEligible,
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
    setAnikotoCatalogProviderId: (id) => setAnikotoCatalogProviderId(id),
  });

  const fetched = await fetchProviderCatalogEpisodes({
    watchStreamProvider,
    animeId,
    dataForResolve,
    signal,
    forceFuzzy,
    isAborted,
  });

  if (isAborted()) return;

  const { providerId, episodes: list } = fetched;

  if (!list.length) {
    try {
      if (watchStreamProvider === 'anikoto') {
        localStorage.removeItem(ANIKOTO_MAPPING_KEY(animeId));
      } else {
        localStorage.removeItem(getMappingCacheKey(animeId, watchStreamProvider));
      }
    } catch {

    }
    if (allowEmptyCatalogRemap && !forceFuzzy && episodeRemapPass === 0) {
      settleLoading.current = false;
      setEpisodeRemapPass((n) => n + 1);
      return;
    }
    setError(emptyCatalogErrorMessage(watchStreamProvider));
    setHikkaCatalogProviderId(null);
    setAnikotoCatalogProviderId(null);
    setHikkaLanguageMenuEligible(false);
    setAnikotoLanguageMenuEligible(false);
    setEpisodes([]);
    setTotalEpisodes(0);
    setEpisodeId(null);
    applyCtx.setProviderCatalogPending(false);
    return;
  }

  if (isAborted()) return;

  const applyOpts: ApplyWatchCatalogSuccessOpts = {
    forceFuzzy,
    freshHikkaCatalog: fetched.freshHikkaCatalog,
    preserveEpisodeNum,
    settleLoading,
  };

  applyWatchCatalogSuccess(applyCtx, dataForResolve, list, providerId, applyOpts);
}
