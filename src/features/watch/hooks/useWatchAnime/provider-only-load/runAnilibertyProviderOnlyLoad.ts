import { readVerifiedLibertyMapping } from '@/features/watch/lib/provider-mapping-cache';

import {
  fetchAnilibertyEpisodesForProviderSwap,
  trySyncAnilibertyProviderSwap,
} from '../anilibertyProviderSwap';
import { restoreCachedAlternateLanguageMenu } from '../watchAnimeCatalogUtils';
import type { ProviderOnlyCatalogLoadInput } from '../providerOnlyCatalogLoadTypes';
import {
  makeProviderSwapCleanup,
  reportProviderSwapCatalogError,
  runProviderSwapPipeline,
} from './providerSwapHelpers';

export function runAnilibertyProviderOnlyLoad(input: ProviderOnlyCatalogLoadInput): () => void {
  const {
    deps,
    animeInfoRef,
    episodeIdRef,
    warmCatalogsRef,
    setProviderCatalogPending,
  } = input;
  const {
    animeId,
    signal,
    isAborted,
    applyCtx,
    menuSetters,
    setAnilibertyCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
    setEpisodes,
    setTotalEpisodes,
    setEpisodeId,
    setError,
  } = deps;

  const dataForResolve = animeInfoRef.current!;
  const preserveEpisodeNum = episodeIdRef.current;
  const warm = warmCatalogsRef.current;

  if (
    trySyncAnilibertyProviderSwap({
      animeId,
      dataForResolve,
      warm,
      preserveEpisodeNum: preserveEpisodeNum ?? null,
      applyCtx,
      warmCatalogsRef,
      setAnilibertyCatalogProviderId,
      setAnilibertyLanguageMenuEligible,
    })
  ) {
    return () => {
      input.markCancelled();
      input.abortSignal();
    };
  }

  restoreCachedAlternateLanguageMenu(animeId, 'aniliberty', menuSetters);
  const cachedLiberty = readVerifiedLibertyMapping(animeId);
  const settleLoading = { current: false };

  void (async () => {
    try {
      if (cachedLiberty?.libertyId) {
        const episodesOnly = await fetchAnilibertyEpisodesForProviderSwap({
          animeId,
          libertyId: cachedLiberty.libertyId,
          dataForResolve,
          signal,
          isAborted,
        });
        if (isAborted()) return;
        if (episodesOnly?.length) {
          if (
            trySyncAnilibertyProviderSwap({
              animeId,
              dataForResolve,
              warm: {
                animeId,
                liberty: {
                  libertyId: cachedLiberty.libertyId,
                  episodes: episodesOnly,
                },
              },
              preserveEpisodeNum: preserveEpisodeNum ?? null,
              applyCtx,
              warmCatalogsRef,
              setAnilibertyCatalogProviderId,
              setAnilibertyLanguageMenuEligible,
            })
          ) {
            return;
          }
        }
      }

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
