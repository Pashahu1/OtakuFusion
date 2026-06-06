import {
  makeProviderSwapCleanup,
  reportProviderSwapCatalogError,
  runProviderSwapPipeline,
} from './providerSwapHelpers';
import type { ProviderOnlyCatalogLoadInput } from '../providerOnlyCatalogLoadTypes';

/** Pipeline fallback when switching to Anikoto from the language menu. */
export function runAnikotoProviderOnlyLoad(input: ProviderOnlyCatalogLoadInput): () => void {
  const { deps, animeInfoRef, episodeIdRef, setProviderCatalogPending } = input;
  const { isAborted, setAnikotoCatalogProviderId, setEpisodes, setTotalEpisodes, setEpisodeId, setError } =
    deps;

  const dataForResolve = animeInfoRef.current!;
  const preserveEpisodeNum = episodeIdRef.current;

  setAnikotoCatalogProviderId(null);

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
