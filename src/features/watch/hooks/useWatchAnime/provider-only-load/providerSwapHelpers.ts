import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ApplyWatchCatalogSuccessContext } from '../applyWatchCatalogSuccess';
import { applyWatchCatalogSuccess } from '../applyWatchCatalogSuccess';
import { getWatchAnimeErrorMessage } from '../watchAnimeCatalogUtils';
import type { WatchAnimeCatalogLoadParams } from '../watchAnimeCatalogLoadTypes';
import type { ProviderOnlyCatalogLoadInput } from '../providerOnlyCatalogLoadTypes';

export function reportProviderSwapCatalogError(
  episodesError: unknown,
  isAborted: () => boolean,
  setError: WatchAnimeCatalogLoadParams['setError'],
  setEpisodes: WatchAnimeCatalogLoadParams['setEpisodes'],
  setTotalEpisodes: WatchAnimeCatalogLoadParams['setTotalEpisodes'],
  setEpisodeId: WatchAnimeCatalogLoadParams['setEpisodeId'],
  setProviderCatalogPending: WatchAnimeCatalogLoadParams['setProviderCatalogPending'],
): void {
  if (isAborted()) return;
  console.warn('[useWatchAnime] provider swap catalog:', episodesError);
  setError(getWatchAnimeErrorMessage(episodesError));
  setEpisodes([]);
  setTotalEpisodes(0);
  setEpisodeId(null);
  setProviderCatalogPending(false);
}

export function applyWarmProviderSwap(
  applyCtx: ApplyWatchCatalogSuccessContext,
  dataForResolve: AnimeData,
  list: EpisodesTypes[],
  providerId: string,
  provider: 'hikka' | 'aniliberty',
  preserveEpisodeNum: string | null,
  setHikkaCatalogProviderId: WatchAnimeCatalogLoadParams['setHikkaCatalogProviderId'],
  setHikkaLanguageMenuEligible: WatchAnimeCatalogLoadParams['setHikkaLanguageMenuEligible'],
  setAnilibertyCatalogProviderId: WatchAnimeCatalogLoadParams['setAnilibertyCatalogProviderId'],
  setAnilibertyLanguageMenuEligible: WatchAnimeCatalogLoadParams['setAnilibertyLanguageMenuEligible'],
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

export function makeProviderSwapCleanup(input: ProviderOnlyCatalogLoadInput): () => void {
  const { markCancelled, abortSignal, setProviderCatalogPending } = input;
  return () => {
    markCancelled();
    abortSignal();
    setProviderCatalogPending(false);
  };
}

export interface ProviderSwapPipelineInput {
  deps: ProviderOnlyCatalogLoadInput['deps'];
  dataForResolve: AnimeData;
  preserveEpisodeNum: string | null;
  settleLoading: { current: boolean };
}

export async function runProviderSwapPipeline({
  deps,
  dataForResolve,
  preserveEpisodeNum,
  settleLoading,
}: ProviderSwapPipelineInput): Promise<void> {
  await deps.runPipeline({
    dataForResolve,
    forceFuzzy: false,
    preserveEpisodeNum,
    settleLoading,
    allowEmptyCatalogRemap: false,
  });
}
