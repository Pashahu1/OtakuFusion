import { useEffect, useRef, useState } from 'react';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

import {
  buildWatchStreamGenerationKey,
  isWatchResolveBlocked,
  primeWatchStreamResolve,
  resetWatchStreamState,
} from './watch-stream/watchStreamResolveGuards';
import { runWatchStreamResolve, trackProviderChange } from './watch-stream/runWatchStreamResolve';
import type {
  UseWatchStreamReturn,
  WatchResolveOptions,
  WatchStreamAnimeMeta,
} from './watch-stream/useWatchStreamTypes';

export type {
  UseWatchStreamReturn,
  WatchStreamAnimeMeta,
  WatchResolveOptions,
} from './watch-stream/useWatchStreamTypes';

export function useWatchStream(
  watchResolveOptions?: WatchResolveOptions,
): UseWatchStreamReturn {
  const [streamInfo, setStreamInfo] = useState<StreamingData | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [buffering, setBuffering] = useState(true);
  const [streamLoadingMessage, setStreamLoadingMessage] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [resolveAttempted, setResolveAttempted] = useState(false);

  const resolveOptsRef = useRef(watchResolveOptions);
  const episodeEpTokenRef = useRef(watchResolveOptions?.episodeEpToken);
  const episodeHasDubRef = useRef(watchResolveOptions?.episodeHasDub);
  const lastResolveProviderRef = useRef<WatchStreamProvider | null>(null);
  const generationKey = buildWatchStreamGenerationKey(watchResolveOptions);
  const [boundGenerationKey, setBoundGenerationKey] = useState<string | null>(null);

  useEffect(() => {
    if (!streamUrl || buffering) return;
    setBoundGenerationKey(generationKey);
  }, [streamUrl, buffering, generationKey]);

  const streamGenerationStale =
    boundGenerationKey != null && boundGenerationKey !== generationKey;
  const publicStreamUrl = streamGenerationStale ? null : streamUrl;
  const publicBuffering = streamGenerationStale || buffering;

  useEffect(() => {
    resolveOptsRef.current = watchResolveOptions;
    episodeEpTokenRef.current = watchResolveOptions?.episodeEpToken;
    episodeHasDubRef.current = watchResolveOptions?.episodeHasDub;

    if (isWatchResolveBlocked(watchResolveOptions)) {
      resetWatchStreamState({
        setStreamInfo,
        setStreamUrl,
        setSubtitles,
        setThumbnail,
        setBuffering,
        setStreamLoadingMessage,
        setResolveAttempted,
        setError,
        setErrorCode,
      });
      return;
    }

    const activeOpts = watchResolveOptions!;
    const streamAnime = activeOpts.streamAnime!;
    const sp = activeOpts.watchStreamProvider;
    const providerJustChanged = trackProviderChange(sp, activeOpts.animeId, {
      resolveOptsRef,
      episodeEpTokenRef,
      episodeHasDubRef,
      lastResolveProviderRef,
    });

    const controller = new AbortController();
    const { signal } = controller;

    primeWatchStreamResolve({
      setError,
      setErrorCode,
      setStreamLoadingMessage,
      setResolveAttempted,
      setBuffering,
      setStreamInfo,
      setStreamUrl,
      setSubtitles,
      setThumbnail,
    });

    void runWatchStreamResolve({
      activeOpts,
      streamAnime,
      signal,
      providerJustChanged,
      resolvePreferredLang: activeOpts.preferredLang,
      resolveLangRevision: activeOpts.streamLangRevision,
      refs: {
        resolveOptsRef,
        episodeEpTokenRef,
        episodeHasDubRef,
        lastResolveProviderRef,
      },
      setters: {
        setStreamInfo,
        setStreamUrl,
        setSubtitles,
        setThumbnail,
        setBuffering,
        setStreamLoadingMessage,
        setResolveAttempted,
        setError,
        setErrorCode,
      },
    });

    return () => {
      setStreamLoadingMessage(null);
      controller.abort();
    };
  }, [
    watchResolveOptions?.animeId,
    watchResolveOptions?.episodeId,
    watchResolveOptions?.providerAnimeId,
    watchResolveOptions?.preferredLang,
    watchResolveOptions?.watchStreamProvider,
    watchResolveOptions?.streamLangRevision,
    watchResolveOptions?.episodeDubStateKey,
    watchResolveOptions?.episodeEpToken,
    watchResolveOptions?.expectedEpisodes,
    watchResolveOptions?.anilistStillAiring,
    watchResolveOptions?.providerCatalogPending,
    watchResolveOptions?.episodesSourceProvider,
    watchResolveOptions?.anilibertyCatalogVerified,
    watchResolveOptions?.streamAnime?.id,
    watchResolveOptions?.streamAnime?.title,
    watchResolveOptions?.streamAnime?.mal_id,
  ]);

  return {
    streamInfo: streamGenerationStale ? null : streamInfo,
    streamUrl: publicStreamUrl,
    buffering: publicBuffering,
    streamLoadingMessage,
    subtitles,
    thumbnail,
    error,
    errorCode,
    resolveAttempted,
  };
}
