import { useEffect, useRef, useState } from 'react';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData, StreamQualityVariant } from '@/shared/types/StreamingTypes';
import type { VideoTrack } from '@/shared/types/VideoTrackTypes';
import type { WatchStreamProvider } from '@/lib/watch-provider';
import { resolveWatchStream } from '@/services/resolveWatchStream';
import { STORAGE_SERVER_NAME } from '@/shared/data/servers';

export interface UseWatchStreamReturn {
  streamInfo: StreamingData | null;
  streamUrl: string | null;
  buffering: boolean;
  /** Підпис під лоадером під час авто-retry (англійською). */
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
  /**
   * Збільшується лише при явній зміні доріжки в UI (Japanese / English).
   * Не змінювати при авто-синхроні після fallback dub→sub — інакше подвійний resolve.
   */
  streamLangRevision: number;
  /** Зміна коли з’являється факт hasDub на епізоді / серії — окремий повторний resolve. */
  episodeDubStateKey: string;
}

/** Один повторний resolve після помилки при перемиканні епізоду (cold CDN / rate limit). */
const WATCH_RESOLVE_AUTO_RETRY_DELAY_SEC = 3;

function formatAutoRetryCountdownMessage(secondsLeft: number): string {
  const unit = secondsLeft === 1 ? 'second' : 'seconds';
  return `Couldn't start playback. Retrying in ${secondsLeft} ${unit}…`;
}

const WATCH_RESOLVE_AUTO_RETRY_REFRESHING_MSG = 'Refreshing stream…';

const WATCH_RESOLVE_UPSTREAM_HINTS: Record<string, string> = {
  'no_working_source|sub_not_available':
    'No playable subtitled stream was found for this episode. Try another episode or try again later.',
  'no_working_source|dub_not_available':
    'No playable dubbed stream was found for this episode. Try subtitles or another episode.',
  no_working_source:
    'Could not play this HLS source — it may be blocked or no longer available. Try another episode, provider, or later.',
  'no_working_source|aniliberty_sources_empty':
    'Anilibria did not return an HLS playlist for this episode. Try Animepahe or another episode.',
  'lang must be sub or dub':
    'Invalid stream language parameter. Refresh the page or toggle Sub/Dub.',
};

function delayMs(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort);
  });
}

function clearStoredServerHint(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_SERVER_NAME);
  } catch {
    /* ignore */
  }
}

/** Помилки, де повтор через 3 с майже ніколи не допоможе. */
function shouldAutoRetryWatchResolve(err: unknown): boolean {
  if (err instanceof Error && err.name === 'AbortError') return false;
  if (!(err instanceof Error)) return true;
  const key = err.message.trim().toLowerCase();
  if (key === 'invalid episode number.') return false;
  if (key.includes('lang must')) return false;
  if (key.includes('episode is required')) return false;
  return true;
}

function getErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'Something went wrong. Please try again.';
  const key = err.message.trim();
  return (
    WATCH_RESOLVE_UPSTREAM_HINTS[key] ??
    (key.includes('|')
      ? WATCH_RESOLVE_UPSTREAM_HINTS[key.split('|')[0] ?? ''] ?? key
      : key)
  );
}

function parseSubtitleTracks(
  tracks: Array<{ file: string; kind?: string; label?: string; default?: boolean }>
): SubtitleItem[] {
  return tracks
    .filter((t) => {
      if (!t.file?.trim()) return false;
      const kind = t.kind?.trim().toLowerCase();
      if (!kind) return true;
      if (kind === 'thumbnails' || kind === 'thumbnail' || kind === 'thumbs') return false;
      return true;
    })
    .map((t) => ({
      file: t.file,
      label: t.label?.trim() || 'Subtitle',
      ...(typeof t.default === 'boolean' ? { default: t.default } : {}),
    }));
}

function isEnglishSubtitleLabel(label: string): boolean {
  const n = label.trim().toLowerCase();
  return n.includes('english') || n === 'eng' || n.startsWith('en ');
}

function isEnglishAiSubtitleLabel(label: string): boolean {
  const n = label.trim().toLowerCase();
  if (!isEnglishSubtitleLabel(label)) return false;
  return n.includes('ai') || n.includes('(ai)') || n.includes('[ai]');
}

function filterSubtitleTracksByStreamLang(
  tracks: SubtitleItem[],
  streamLang: 'sub' | 'dub'
): SubtitleItem[] {
  if (!tracks.length) return tracks;
  if (streamLang === 'dub') {
    const englishAi = tracks.filter((t) => isEnglishAiSubtitleLabel(t.label));
    if (englishAi.length) return englishAi;
    const english = tracks.filter((t) => isEnglishSubtitleLabel(t.label));
    return english.length ? english : tracks;
  }
  const nonEnglishAi = tracks.filter((t) => !isEnglishAiSubtitleLabel(t.label));
  return nonEnglishAi.length ? nonEnglishAi : tracks;
}

function normalizeQualityVariantsFromResolve(
  raw: unknown
): StreamingData['qualityVariants'] | undefined {
  if (!Array.isArray(raw) || raw.length < 2) return undefined;
  const out: StreamQualityVariant[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
    const r = row as Record<string, unknown>;
    const height = Number(r.height);
    const url = typeof r.url === 'string' ? r.url.trim() : '';
    const label = typeof r.label === 'string' ? r.label.trim() : '';
    const rhRaw = r.request_headers;
    let request_headers: Record<string, string> | undefined;
    if (rhRaw && typeof rhRaw === 'object' && !Array.isArray(rhRaw)) {
      const acc: Record<string, string> = {};
      for (const [k, v] of Object.entries(rhRaw)) {
        if (typeof k !== 'string' || !k.trim()) continue;
        if (typeof v !== 'string' || !v.trim()) continue;
        acc[k.trim()] = v.trim();
      }
      if (Object.keys(acc).length > 0) request_headers = acc;
    }
    if (!Number.isFinite(height) || height <= 0 || !url) continue;
    out.push({ height, label: label || `${height}p`, url, request_headers });
  }
  return out.length > 1 ? out : undefined;
}

function getThumbnailTrack(tracks: VideoTrack[]): string | null {
  const thumbnail = tracks.find(
    (t) =>
      (t.kind === 'thumbnails' || t.kind === 'thumbnail' || t.kind === 'thumbs') &&
      t.file?.trim()
  );
  return thumbnail?.file ?? null;
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
  /** Після першого завершення resolve (успіх або помилка) — щоб не показувати recovery «миготінням». */
  const [resolveAttempted, setResolveAttempted] = useState(false);

  const resolveOptsRef = useRef(watchResolveOptions);
  resolveOptsRef.current = watchResolveOptions;

  /** Актуальний ep_token без повторного resolve при тій самій серії (див. deps ефекту). */
  const episodeEpTokenRef = useRef(watchResolveOptions?.episodeEpToken);
  episodeEpTokenRef.current = watchResolveOptions?.episodeEpToken;
  const episodeHasDubRef = useRef(watchResolveOptions?.episodeHasDub);
  episodeHasDubRef.current = watchResolveOptions?.episodeHasDub;

  useEffect(() => {
    if (!watchResolveOptions?.streamAnime || !watchResolveOptions.episodeId) {
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

    const streamAnime = watchResolveOptions.streamAnime;
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

    const applyResolveSuccess = (
      result: Awaited<ReturnType<typeof resolveWatchStream>>,
      resolveParams: { lang: 'sub' | 'dub' }
    ) => {
      const opts = resolveOptsRef.current;
      const tracks = [] as VideoTrack[];

      const resolvedServerLabel = result.stream.server?.trim();
      if (
        typeof window !== 'undefined' &&
        resolvedServerLabel &&
        resolvedServerLabel !== 'Resolved'
      ) {
        try {
          localStorage.setItem(STORAGE_SERVER_NAME, resolvedServerLabel);
        } catch {
          /* ignore */
        }
      }

      for (const t of result.stream.tracks ?? []) {
        if (!t.file?.trim()) continue;
        tracks.push({
          file: t.file,
          kind: t.kind ?? 'captions',
          label: t.label ?? 'Track',
          default: Boolean(t.default),
        });
      }

      setStreamInfo({
        streamingLink: [
          {
            id: 1,
            type: result.stream.lang,
            link: { file: result.stream.url, type: 'hls' },
            tracks,
            server: result.stream.server || 'Resolved',
            request_headers: result.stream.request_headers,
          },
        ],
        servers: [],
        skipSegments: result.segments,
        qualityVariants: normalizeQualityVariantsFromResolve(
          (result as { quality_variants?: unknown }).quality_variants
        ),
      });
      setStreamUrl(result.stream.url);
      const subtitleItems = filterSubtitleTracksByStreamLang(
        parseSubtitleTracks(result.stream.tracks),
        result.stream.lang
      );
      setSubtitles(subtitleItems);
      setThumbnail(getThumbnailTrack(tracks));

      if (resolveParams.lang !== result.stream.lang) {
        opts?.onPlaybackLangResolved?.(result.stream.lang);
      }
    };

    const runResolveAttempt = async (): Promise<void> => {
      const opts = resolveOptsRef.current;
      const episodeNumber = Number(watchResolveOptions.episodeId);
      if (!Number.isFinite(episodeNumber) || episodeNumber <= 0) {
        throw new Error('Invalid episode number.');
      }

      const preferredLang = opts?.preferredLang ?? 'sub';
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
        localAnimeId: watchResolveOptions.animeId,
        providerAniId: watchResolveOptions.providerAnimeId ?? undefined,
        episodeEpToken: episodeEpTokenRef.current?.trim() || undefined,
        episodeHasDub: episodeHasDubRef.current,
        episode: episodeNumber,
        lang: preferredLang,
        streamProvider:
          watchResolveOptions.watchStreamProvider === 'aniliberty'
            ? ('aniliberty' as const)
            : ('animepahe' as const),
      };

      const hadServerHint =
        typeof window !== 'undefined' &&
        Boolean(localStorage.getItem(STORAGE_SERVER_NAME)?.trim());

      let result: Awaited<ReturnType<typeof resolveWatchStream>>;
      try {
        result = await resolveWatchStream(resolveParams, signal);
      } catch (firstErr) {
        if (signal.aborted) return;
        if (!hadServerHint) throw firstErr;
        clearStoredServerHint();
        result = await resolveWatchStream(resolveParams, signal);
      }

      if (signal.aborted) return;
      applyResolveSuccess(result, resolveParams);
    };

    const reportResolveError = (err: unknown) => {
      console.error('Error resolving watch stream:', err);
      const raw =
        err instanceof Error && typeof err.message === 'string'
          ? err.message.trim()
          : 'unknown';
      setErrorCode(raw);
      setError(getErrorMessage(err));
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
          for (let sec = WATCH_RESOLVE_AUTO_RETRY_DELAY_SEC; sec >= 1; sec--) {
            if (signal.aborted) return;
            setStreamLoadingMessage(formatAutoRetryCountdownMessage(sec));
            await delayMs(1000, signal);
          }
          setStreamLoadingMessage(WATCH_RESOLVE_AUTO_RETRY_REFRESHING_MSG);
          clearStoredServerHint();
          await runResolveAttempt();
          setStreamLoadingMessage(null);
        } catch (retryErr) {
          if (signal.aborted) return;
          if (retryErr instanceof Error && retryErr.name === 'AbortError') return;
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
