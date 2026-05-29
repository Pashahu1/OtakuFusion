import { useEffect, useRef, useState } from 'react';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
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

export interface UseWatchStreamReturn {
  streamInfo: StreamingData | null;
  streamUrl: string | null;
  buffering: boolean;

  streamLoadingMessage: string | null;
  subtitles: SubtitleItem[];
  thumbnail: string | null;
  error: string | null;
  errorCode: string | null;
  resolveAttempted: boolean;
}

export interface WatchStreamAnimeMeta {
  id: string;
  mal_id: number | null;
  title: string;
}

interface WatchResolveOptions {
  animeId: string;
  episodeId: string | null;
  streamAnime: WatchStreamAnimeMeta | null;
  providerAnimeId?: string | null;
  episodeEpToken?: string | null;
  episodeHasDub?: boolean;
  preferredLang: 'sub' | 'dub';
  onPlaybackLangResolved?: (lang: 'sub' | 'dub') => void;
  watchStreamProvider: WatchStreamProvider;

  streamLangRevision: number;

  episodeDubStateKey: string;

  expectedEpisodes?: number;
  anilistStillAiring?: boolean;

  providerCatalogPending?: boolean;

  episodesSourceProvider?: WatchStreamProvider | null;

  onAutoRetryExhausted?: () => void;

  anilibertyCatalogVerified?: boolean;
}

function isWatchResolveBlocked(opts: WatchResolveOptions | undefined): boolean {
  if (!opts?.streamAnime || !opts.episodeId) return true;
  const sp = opts.watchStreamProvider;
  const epSource = opts.episodesSourceProvider;

  if (epSource != null && epSource !== sp) return true;
  if (opts.providerCatalogPending === true) return true;

  const providerId = opts.providerAnimeId?.trim() ?? '';
  if (sp === 'animepahe') {
    if (!providerId) return true;
    if (!opts.episodeEpToken?.trim()) return true;
    return false;
  }

  const needsProviderCatalog = sp === 'hikka' || sp === 'aniliberty';
  if (needsProviderCatalog && !providerId) return true;
  return false;
}

export function useWatchStream(
  watchResolveOptions?: WatchResolveOptions
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
  resolveOptsRef.current = watchResolveOptions;

  const episodeEpTokenRef = useRef(watchResolveOptions?.episodeEpToken);
  episodeEpTokenRef.current = watchResolveOptions?.episodeEpToken;
  const episodeHasDubRef = useRef(watchResolveOptions?.episodeHasDub);
  episodeHasDubRef.current = watchResolveOptions?.episodeHasDub;
  const lastResolveProviderRef = useRef<WatchStreamProvider | null>(null);

  useEffect(() => {
    if (isWatchResolveBlocked(watchResolveOptions)) {
      setStreamInfo(null);
      setStreamUrl(null);
      setSubtitles([]);
      setThumbnail(null);
      setBuffering(true);
      setStreamLoadingMessage(null);
      setResolveAttempted(false);
      setError(null);
      setErrorCode(null);
      return;
    }

    const activeOpts = watchResolveOptions!;
    const streamAnime = activeOpts.streamAnime!;
    const sp = activeOpts.watchStreamProvider;
    const providerJustChanged =
      lastResolveProviderRef.current != null && lastResolveProviderRef.current !== sp;
    lastResolveProviderRef.current = sp;
    if (providerJustChanged) {
      clearStoredServerHint(sp, activeOpts.animeId);
    }

    const resolveLangRevision = activeOpts.streamLangRevision;
    const resolvePreferredLang = activeOpts.preferredLang;

    const controller = new AbortController();
    const { signal } = controller;
    setError(null);
    setErrorCode(null);
    setStreamLoadingMessage(null);
    setResolveAttempted(false);
    setBuffering(true);
    setStreamInfo(null);
    setStreamUrl(null);
    setSubtitles([]);
    setThumbnail(null);

    const applySuccessCtx = {
      resolveOptsRef,
      resolveLangRevision,
      watchStreamProvider: sp,
      setStreamInfo,
      setStreamUrl,
      setSubtitles,
      setThumbnail,
    };

    const runResolveAttempt = async (): Promise<void> => {
      const opts = resolveOptsRef.current;
      const episodeNumber = Number(activeOpts.episodeId);
      if (!Number.isFinite(episodeNumber) || episodeNumber <= 0) {
        throw new Error('Invalid episode number.');
      }

      const preferredLang = resolvePreferredLang ?? opts?.preferredLang ?? 'sub';
      const anilistFromMeta = (() => {
        const raw = streamAnime.id?.trim();
        if (!raw) return undefined;
        const n = Number(raw);
        return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
      })();

      const resolveParams = {
        anilistId: anilistFromMeta,
        malId:
          typeof streamAnime.mal_id === 'number' && streamAnime.mal_id > 0
            ? streamAnime.mal_id
            : undefined,
        keyword: streamAnime.title,
        localAnimeId: activeOpts.animeId,
        providerAniId: activeOpts.providerAnimeId ?? undefined,
        episodeEpToken: episodeEpTokenRef.current?.trim() || undefined,
        episodeHasDub: episodeHasDubRef.current,
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
      setErrorCode(raw);
      setError(getWatchResolveErrorMessage(err));
    };

    void (async () => {
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
            setStreamLoadingMessage,
            runResolveAttempt,
          });
        } catch (retryErr) {
          if (signal.aborted) return;
          if (retryErr instanceof Error && retryErr.name === 'AbortError') return;
          resolveOptsRef.current?.onAutoRetryExhausted?.();
          reportResolveError(retryErr);
        }
      } finally {
        if (!signal.aborted) {
          setStreamLoadingMessage(null);
          setBuffering(false);
          setResolveAttempted(true);
        }
      }
    })();

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
    streamInfo,
    streamUrl,
    buffering,
    streamLoadingMessage,
    subtitles,
    thumbnail,
    error,
    errorCode,
    resolveAttempted,
  };
}
