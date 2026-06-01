import { restoreCachedAlternateLanguageMenu } from './watchAnimeCatalogUtils';
import type { ProviderOnlyCatalogLoadInput } from './providerOnlyCatalogLoadTypes';
import { applyWarmProviderSwap } from './provider-only-load/providerSwapHelpers';
import { runAnilibertyProviderOnlyLoad } from './provider-only-load/runAnilibertyProviderOnlyLoad';
import { runHikkaProviderOnlyLoad } from './provider-only-load/runHikkaProviderOnlyLoad';

export type { ProviderOnlyCatalogLoadInput } from './providerOnlyCatalogLoadTypes';

/** Cleanup for effect when only provider changes (no full page reload). */
export function runProviderOnlyCatalogLoad(
  input: ProviderOnlyCatalogLoadInput,
): () => void {
  const {
    deps,
    animeInfoRef,
    stableWatchLoadRef,
    warmCatalogsRef,
    setProviderCatalogPending,
  } = input;
  const {
    animeId,
    watchStreamProvider,
    applyCtx,
    menuSetters,
    setHikkaCatalogProviderId,
    setAnilibertyCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
    setError,
  } = deps;

  const dataForResolve = animeInfoRef.current;
  if (!dataForResolve) {
    stableWatchLoadRef.current = null;
    return () => {
      input.markCancelled();
      input.abortSignal();
    };
  }

  setProviderCatalogPending(true);
  setError(null);
  restoreCachedAlternateLanguageMenu(animeId, watchStreamProvider, menuSetters);

  const preserveEpisodeNum = input.episodeIdRef.current;
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
      setAnilibertyLanguageMenuEligible,
    );
    return () => {
      input.markCancelled();
      input.abortSignal();
    };
  }

  if (watchStreamProvider === 'aniliberty') {
    return runAnilibertyProviderOnlyLoad(input);
  }

  return runHikkaProviderOnlyLoad(input);
}
