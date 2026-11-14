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
import { getMappingCacheKey } from '@/features/watch/lib/provider-mapping-cache';

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
  setHikkaLanguageMenuEligible: React.Dispatch<React.SetStateAction<boolean>>;
  setEpisodes: React.Dispatch<React.SetStateAction<EpisodesTypes[] | null>>;
  setTotalEpisodes: React.Dispatch<React.SetStateAction<number | null>>;
  setEpisodeId: React.Dispatch<React.SetStateAction<string | null>>;
  setEpisodeRemapPass: React.Dispatch<React.SetStateAction<number>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

function emptyCatalogErrorMessage(_provider: WatchStreamProvider): string {
  return 'Ukrainian sources returned an empty episode list. Try again later.';
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
      localStorage.removeItem(getMappingCacheKey(animeId, watchStreamProvider));
    } catch {

    }
    if (allowEmptyCatalogRemap && !forceFuzzy && episodeRemapPass === 0) {
      settleLoading.current = false;
      setEpisodeRemapPass((n) => n + 1);
      return;
    }
    setError(emptyCatalogErrorMessage(watchStreamProvider));
    setHikkaCatalogProviderId(null);
    setHikkaLanguageMenuEligible(false);
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
    ukrainianPlayable: fetched.ukrainianPlayable,
    preserveEpisodeNum,
    settleLoading,
  };

  applyWatchCatalogSuccess(applyCtx, dataForResolve, list, providerId, applyOpts);
}
