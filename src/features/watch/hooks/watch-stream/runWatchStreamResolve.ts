import { resolveWatchStream } from '@/features/watch/lib/resolve-watch-stream';
import { readAnilibertyPlaybackQualityHint } from '@/shared/utils/anilibertyPlaybackQualityHint';
import { STORAGE_SERVER_NAME } from '@/shared/data/servers';
import { applyResolveSuccess } from '@/features/watch/hooks/mapResolveToPlayerState';
import { getWatchResolveErrorMessage } from '@/features/watch/hooks/watchResolveErrorMessages';
import {
  clearStoredServerHint,
  runWatchResolveAutoRetry,
  shouldAutoRetryWatchResolve,
} from '@/features/watch/hooks/watchResolveRetry';

import { buildWatchResolveParams } from './buildWatchResolveParams';
import type {
  WatchResolveOptions,
  WatchStreamAnimeMeta,
  WatchStreamResolveRefs,
  WatchStreamResolveSetters,
} from './useWatchStreamTypes';

interface RunWatchStreamResolveParams {
  activeOpts: WatchResolveOptions;
  streamAnime: WatchStreamAnimeMeta;
  signal: AbortSignal;
  providerJustChanged: boolean;
  resolvePreferredLang: 'sub' | 'dub';
  resolveLangRevision: number;
  refs: WatchStreamResolveRefs;
  setters: WatchStreamResolveSetters;
}

function isExpectedNoSourceResolveError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const key = err.message.trim().toLowerCase();
  return (
    key.includes('no_working_source') ||
    key.includes('sources_empty') ||
    key.includes('episode_not_found') ||
    key.includes('watch_resolve_failed_404')
  );
}

export async function runWatchStreamResolve({
  activeOpts,
  streamAnime,
  signal,
  providerJustChanged,
  resolvePreferredLang,
  resolveLangRevision,
  refs,
  setters,
}: RunWatchStreamResolveParams): Promise<void> {
  const sp = activeOpts.watchStreamProvider;
  const applySuccessCtx = {
    resolveOptsRef: refs.resolveOptsRef,
    resolveLangRevision,
    watchStreamProvider: sp,
    setStreamInfo: setters.setStreamInfo,
    setStreamUrl: setters.setStreamUrl,
    setSubtitles: setters.setSubtitles,
    setThumbnail: setters.setThumbnail,
  };

  const runResolveAttempt = async (): Promise<void> => {
    const opts = refs.resolveOptsRef.current;
    const episodeNumber = Number(activeOpts.episodeId);
    if (!Number.isFinite(episodeNumber) || episodeNumber <= 0) {
      throw new Error('Invalid episode number.');
    }

    const preferredLang = resolvePreferredLang ?? opts?.preferredLang ?? 'sub';
    const resolveParams = buildWatchResolveParams(
      activeOpts,
      streamAnime,
      preferredLang,
      refs,
    );

    const hadServerHint =
      typeof window !== 'undefined' &&
      (activeOpts.watchStreamProvider === 'aniliberty'
        ? Boolean(readAnilibertyPlaybackQualityHint())
        : activeOpts.watchStreamProvider === 'hikka'
          ? Boolean(localStorage.getItem(STORAGE_SERVER_NAME)?.trim())
          : false);

    let result: Awaited<ReturnType<typeof resolveWatchStream>>;
    try {
      result = await resolveWatchStream(resolveParams, signal);
    } catch (firstErr) {
      if (signal.aborted) return;
      if (!hadServerHint) throw firstErr;
      clearStoredServerHint(activeOpts.watchStreamProvider, activeOpts.animeId);
      result = await resolveWatchStream(resolveParams, signal);
    }

    if (signal.aborted) return;
    applyResolveSuccess(result, resolveParams, applySuccessCtx);
  };

  const reportResolveError = (err: unknown) => {
    if (isExpectedNoSourceResolveError(err)) {
      console.info('Watch stream not available for selection:', err);
    } else {
      console.error('Error resolving watch stream:', err);
    }
    const raw =
      err instanceof Error && typeof err.message === 'string'
        ? err.message.trim()
        : 'unknown';
    setters.setErrorCode(raw);
    setters.setError(getWatchResolveErrorMessage(err));
  };

  try {
    await runResolveAttempt();
  } catch (firstErr) {
    if (signal.aborted) return;
    if (firstErr instanceof Error && firstErr.name === 'AbortError') return;

    if (!shouldAutoRetryWatchResolve(firstErr)) {
      if (
        isExpectedNoSourceResolveError(firstErr) &&
        activeOpts.watchStreamProvider !== 'anikoto'
      ) {
        activeOpts.onAutoRetryExhausted?.();
        return;
      }
      reportResolveError(firstErr);
      return;
    }

    try {
      await runWatchResolveAutoRetry({
        signal,
        providerJustChanged,
        watchStreamProvider: activeOpts.watchStreamProvider,
        localAnimeId: activeOpts.animeId,
        setStreamLoadingMessage: setters.setStreamLoadingMessage,
        runResolveAttempt,
      });
    } catch (retryErr) {
      if (signal.aborted) return;
      if (retryErr instanceof Error && retryErr.name === 'AbortError') return;
      refs.resolveOptsRef.current?.onAutoRetryExhausted?.();
      reportResolveError(retryErr);
    }
  } finally {
    if (!signal.aborted) {
      setters.setStreamLoadingMessage(null);
      setters.setBuffering(false);
      setters.setResolveAttempted(true);
    }
  }
}

export function trackProviderChange(
  sp: WatchResolveOptions['watchStreamProvider'],
  animeId: string,
  refs: WatchStreamResolveRefs,
): boolean {
  const providerJustChanged =
    refs.lastResolveProviderRef.current != null &&
    refs.lastResolveProviderRef.current !== sp;
  refs.lastResolveProviderRef.current = sp;
  if (providerJustChanged) {
    clearStoredServerHint(sp, animeId);
  }
  return providerJustChanged;
}
