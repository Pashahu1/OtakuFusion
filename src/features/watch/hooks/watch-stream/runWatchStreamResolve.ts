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

function buildResolveParams(
  activeOpts: WatchResolveOptions,
  streamAnime: WatchStreamAnimeMeta,
  preferredLang: 'sub' | 'dub',
  refs: WatchStreamResolveRefs,
) {
  const episodeNumber = Number(activeOpts.episodeId);
  const opts = refs.resolveOptsRef.current;
  const anilistFromMeta = (() => {
    const raw = streamAnime.id?.trim();
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
  })();

  return {
    anilistId: anilistFromMeta,
    malId:
      typeof streamAnime.mal_id === 'number' && streamAnime.mal_id > 0
        ? streamAnime.mal_id
        : undefined,
    keyword: streamAnime.title,
    localAnimeId: activeOpts.animeId,
    providerAniId: activeOpts.providerAnimeId ?? undefined,
    episodeEpToken: refs.episodeEpTokenRef.current?.trim() || undefined,
    episodeHasDub: refs.episodeHasDubRef.current,
    episode: episodeNumber,
    expectedEpisodes:
      typeof opts?.expectedEpisodes === 'number' && opts.expectedEpisodes > 0
        ? Math.floor(opts.expectedEpisodes)
        : undefined,
    anilistStillAiring: opts?.anilistStillAiring === true,
    lang: preferredLang,
    streamProvider:
      activeOpts.watchStreamProvider === 'aniliberty'
        ? ('aniliberty' as const)
        : activeOpts.watchStreamProvider === 'hikka'
          ? ('hikka' as const)
          : ('animepahe' as const),
    anilibertyCatalogVerified:
      activeOpts.watchStreamProvider === 'aniliberty' &&
      activeOpts.anilibertyCatalogVerified === true,
  };
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
    const resolveParams = buildResolveParams(activeOpts, streamAnime, preferredLang, refs);

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
    console.error('Error resolving watch stream:', err);
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
