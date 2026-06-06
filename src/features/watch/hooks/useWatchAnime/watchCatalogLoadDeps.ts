import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { ApplyWatchCatalogSuccessContext } from './applyWatchCatalogSuccess';
import { runWatchCatalogPipeline } from './runWatchCatalogPipeline';
import type { AlternateLanguageMenuSetters, StableWatchLoadSnapshot } from './types';
import type { WatchAnimeCatalogLoadParams } from './watchAnimeCatalogLoadTypes';

export interface WatchCatalogPipelineRunParams {
  dataForResolve: AnimeData;
  forceFuzzy: boolean;
  preserveEpisodeNum: string | null;
  settleLoading: { current: boolean };
  allowEmptyCatalogRemap: boolean;
}

export interface WatchCatalogLoadEffectDeps {
  animeId: string;
  episodeRemapPass: number;
  watchStreamProvider: WatchStreamProvider;
  signal: AbortSignal;
  isAborted: () => boolean;
  applyCtx: ApplyWatchCatalogSuccessContext;
  menuSetters: AlternateLanguageMenuSetters;
  runPipeline: (pipelineParams: WatchCatalogPipelineRunParams) => Promise<void>;
  setAnilibertyCatalogProviderId: WatchAnimeCatalogLoadParams['setAnilibertyCatalogProviderId'];
  setHikkaCatalogProviderId: WatchAnimeCatalogLoadParams['setHikkaCatalogProviderId'];
  setAnikotoCatalogProviderId: WatchAnimeCatalogLoadParams['setAnikotoCatalogProviderId'];
  setAnilibertyLanguageMenuEligible: WatchAnimeCatalogLoadParams['setAnilibertyLanguageMenuEligible'];
  setHikkaLanguageMenuEligible: WatchAnimeCatalogLoadParams['setHikkaLanguageMenuEligible'];
  setAnikotoLanguageMenuEligible: WatchAnimeCatalogLoadParams['setAnikotoLanguageMenuEligible'];
  setEpisodes: WatchAnimeCatalogLoadParams['setEpisodes'];
  setTotalEpisodes: WatchAnimeCatalogLoadParams['setTotalEpisodes'];
  setEpisodeId: WatchAnimeCatalogLoadParams['setEpisodeId'];
  setEpisodeRemapPass: WatchAnimeCatalogLoadParams['setEpisodeRemapPass'];
  setError: WatchAnimeCatalogLoadParams['setError'];
}

export function isProviderOnlyCatalogLoad(
  stableWatchLoadRef: React.MutableRefObject<StableWatchLoadSnapshot | null>,
  animeId: string,
  episodeRemapPass: number,
  watchStreamProvider: WatchStreamProvider
): boolean {
  const snapshot = stableWatchLoadRef.current;
  return (
    snapshot !== null &&
    snapshot.animeId === animeId &&
    snapshot.remap === episodeRemapPass &&
    snapshot.provider !== watchStreamProvider
  );
}

export function buildWatchCatalogLoadEffectDeps(
  params: WatchAnimeCatalogLoadParams,
  signal: AbortSignal,
  isAborted: () => boolean
): WatchCatalogLoadEffectDeps {
  const {
    animeId,
    episodeRemapPass,
    watchStreamProvider,
    initialEpisodeRef,
    stableWatchLoadRef,
    warmCatalogsRef,
    deferredOppositePrefetchRef,
    setAnimeInfo,
    setEpisodes,
    setAnilibertyCatalogProviderId,
    setHikkaCatalogProviderId,
    setAnikotoCatalogProviderId,
    setTotalEpisodes,
    setEpisodeId,
    setAnimeInfoLoading,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
    setAnikotoLanguageMenuEligible,
    setProviderCatalogPending,
    setEpisodesSourceProvider,
    setEpisodeRemapPass,
    setError,
  } = params;

  const menuSetters: AlternateLanguageMenuSetters = {
    setHikkaCatalogProviderId,
    setHikkaLanguageMenuEligible,
    setAnilibertyCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
    setAnikotoCatalogProviderId,
    setAnikotoLanguageMenuEligible,
  };

  const applyCtx: ApplyWatchCatalogSuccessContext = {
    animeId,
    episodeRemapPass,
    watchStreamProvider,
    getIsCancelled: isAborted,
    initialEpisodeRef,
    stableWatchLoadRef,
    warmCatalogsRef,
    deferredOppositePrefetchRef,
    menuSetters,
    setAnimeInfo,
    setEpisodes,
    setAnilibertyCatalogProviderId,
    setHikkaCatalogProviderId,
    setAnikotoCatalogProviderId,
    setTotalEpisodes,
    setEpisodeId,
    setAnimeInfoLoading,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
    setAnikotoLanguageMenuEligible,
    setProviderCatalogPending,
    setEpisodesSourceProvider,
  };

  const runPipeline = (pipelineParams: WatchCatalogPipelineRunParams) =>
    runWatchCatalogPipeline({
      watchStreamProvider,
      animeId,
      episodeRemapPass,
      dataForResolve: pipelineParams.dataForResolve,
      forceFuzzy: pipelineParams.forceFuzzy,
      preserveEpisodeNum: pipelineParams.preserveEpisodeNum,
      settleLoading: pipelineParams.settleLoading,
      allowEmptyCatalogRemap: pipelineParams.allowEmptyCatalogRemap,
      signal,
      isAborted,
      applyCtx,
      setAnilibertyCatalogProviderId,
      setHikkaCatalogProviderId,
      setAnikotoCatalogProviderId,
      setAnilibertyLanguageMenuEligible,
      setHikkaLanguageMenuEligible,
      setAnikotoLanguageMenuEligible,
      setEpisodes,
      setTotalEpisodes,
      setEpisodeId,
      setEpisodeRemapPass,
      setError,
    });

  return {
    animeId,
    episodeRemapPass,
    watchStreamProvider,
    signal,
    isAborted,
    applyCtx,
    menuSetters,
    runPipeline,
    setAnilibertyCatalogProviderId,
    setHikkaCatalogProviderId,
    setAnikotoCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
    setAnikotoLanguageMenuEligible,
    setEpisodes,
    setTotalEpisodes,
    setEpisodeId,
    setEpisodeRemapPass,
    setError,
  };
}
