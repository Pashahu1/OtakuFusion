import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { ApplyWatchCatalogSuccessContext } from './applyWatchCatalogSuccess';
import { runWatchCatalogPipeline } from './runWatchCatalogPipeline';
import type { StableWatchLoadSnapshot } from './types';
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
  runPipeline: (pipelineParams: WatchCatalogPipelineRunParams) => Promise<void>;
  setHikkaCatalogProviderId: WatchAnimeCatalogLoadParams['setHikkaCatalogProviderId'];
  setHikkaLanguageMenuEligible: WatchAnimeCatalogLoadParams['setHikkaLanguageMenuEligible'];
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
    setHikkaCatalogProviderId,
    setTotalEpisodes,
    setEpisodeId,
    setAnimeInfoLoading,
    setHikkaLanguageMenuEligible,
    setProviderCatalogPending,
    setEpisodesSourceProvider,
    setEpisodeRemapPass,
    setError,
  } = params;

  const applyCtx: ApplyWatchCatalogSuccessContext = {
    animeId,
    episodeRemapPass,
    watchStreamProvider,
    getIsCancelled: isAborted,
    initialEpisodeRef,
    stableWatchLoadRef,
    warmCatalogsRef,
    deferredOppositePrefetchRef,
    setAnimeInfo,
    setEpisodes,
    setHikkaCatalogProviderId,
    setTotalEpisodes,
    setEpisodeId,
    setAnimeInfoLoading,
    setHikkaLanguageMenuEligible,
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
      setHikkaCatalogProviderId,
      setHikkaLanguageMenuEligible,
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
    runPipeline,
    setHikkaCatalogProviderId,
    setHikkaLanguageMenuEligible,
    setEpisodes,
    setTotalEpisodes,
    setEpisodeId,
    setEpisodeRemapPass,
    setError,
  };
}
