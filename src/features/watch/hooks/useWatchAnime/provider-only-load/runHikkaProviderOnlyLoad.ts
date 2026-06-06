import {
  makeProviderSwapCleanup,
  reportProviderSwapCatalogError,
  runProviderSwapPipeline,
} from './providerSwapHelpers';
import type { ProviderOnlyCatalogLoadInput } from '../providerOnlyCatalogLoadTypes';

/** Pipeline fallback when warm swap cache is unavailable (hikka). */
export function runHikkaProviderOnlyLoad(input: ProviderOnlyCatalogLoadInput): () => void {
  const {
    deps,
    animeInfoRef,
    episodeIdRef,
    setProviderCatalogPending,
  } = input;
  const {
    watchStreamProvider,
    isAborted,
    setHikkaCatalogProviderId,
    setEpisodes,
    setTotalEpisodes,
    setEpisodeId,
    setError,
  } = deps;

  const dataForResolve = animeInfoRef.current!;
  const preserveEpisodeNum = episodeIdRef.current;

  if (watchStreamProvider === 'hikka') {
    setHikkaCatalogProviderId(null);
  }

  const settleLoading = { current: false };

  void (async () => {
    try {
      await runProviderSwapPipeline({
        deps,
        dataForResolve,
        preserveEpisodeNum: preserveEpisodeNum ?? null,
        settleLoading,
      });
    } catch (episodesError) {
      reportProviderSwapCatalogError(
        episodesError,
        isAborted,
        setError,
        setEpisodes,
        setTotalEpisodes,
        setEpisodeId,
        setProviderCatalogPending,
      );
    }
  })();

  return makeProviderSwapCleanup(input);
}
