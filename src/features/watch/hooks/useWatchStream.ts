import { useEffect, useState } from 'react';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { VideoTrack } from '@/shared/types/VideoTrackTypes';
import type { Segment } from '@/shared/types/VideoSegmentsTypes';
import type { WatchStreamProvider } from '@/lib/watch-provider';
import { resolveWatchStream } from '@/services/resolveWatchStream';
import { STORAGE_SERVER_NAME } from '@/shared/data/servers';

export interface UseWatchStreamReturn {
  streamInfo: StreamingData | null;
  streamUrl: string | null;
  buffering: boolean;
  subtitles: SubtitleItem[];
  thumbnail: string | null;
  intro: Segment | null;
  outro: Segment | null;
  error: string | null;
  /** Сирий код помилки резолву (до локалізації) — для UI відновлення стріму. */
  errorCode: string | null;
}

/** Лише поля, від яких залежить GET /api/watch/resolve — без `tvInfo.has_sub` тощо, щоб не дублювати резолв після мерджу епізодів. */
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
  preferredLang: 'sub' | 'dub';
  /** Після успішного резолву — синхронізувати перемикач Sub/Dub із реальною доріжкою (`stream.lang`). */
  onPlaybackLangResolved?: (lang: 'sub' | 'dub') => void;
  watchStreamProvider: WatchStreamProvider;
  anilibertyAlias: string | null;
  /** Поки `false` — не резолвити AniLiberty (очікуємо `/api/anilibria/match`). */
  anilibertyMatchDone: boolean;
  /** Інкремент після вибору в UI відновлення — повторний резолв навіть без зміни провайдера. */
  streamRecoveryNonce: number;
}

/** Known error codes from GET /api/watch/resolve (AnimeKai backend). */
const WATCH_RESOLVE_UPSTREAM_HINTS: Record<string, string> = {
  'no_working_source|sub_not_available':
    'AnimeKai could not return a working sub stream for this episode (sub_not_available). Try dub, another episode, or later — the site, links, or decryption may have changed.',
  'no_working_source|dub_not_available':
    'No working dub stream was found for this episode (dub_not_available). Try sub or another episode.',
  no_working_source:
    'Could not get working HLS video: the AnimeKai source may be down, encrypted differently, or the site changed. Try another episode, switch sub/dub, or retry later.',
  anilibria_not_found:
    'No AniLiberty release matched this title from AniList. Try AnimeKai or another title.',
  anilibria_no_episodes:
    'This AniLiberty release has no playable episodes yet or the list is empty.',
  anilibria_no_hls:
    'AniLiberty did not return an HLS URL for this episode. Try another episode or AnimeKai.',
  anilibria_stream_failed:
    'Could not load video from AniLiberty. Try again later or switch to AnimeKai.',
  anilibria_bundle_failed:
    'Could not load AniLiberty data (release or episode lookup).',
  anilibria_missing_alias:
    'Internal error: missing AniLiberty release alias. Refresh the page.',
  anilibria_release_unavailable:
    'AniLiberty release metadata could not be loaded after match. Try again later or use AnimeKai.',
  anilibria_match_rejected:
    'AniLiberty match failed stricter checks (title vs release / episode catalog). Use AnimeKai, or set ANILIBRIA_ANILIST_ALIAS_JSON if you have the correct release alias.',
  episode_out_of_range: 'Invalid episode number for AniLiberty.',
  'lang must be sub or dub':
    'Invalid stream language parameter. Refresh the page or toggle sub/dub.',
};

function getErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'Something went wrong.';
  const key = err.message.trim();
  return (
    WATCH_RESOLVE_UPSTREAM_HINTS[key] ??
    (key.includes('|')
      ? WATCH_RESOLVE_UPSTREAM_HINTS[key.split('|')[0] ?? ''] ?? key
      : key)
  );
}

function parseSegment(input: { start: number; end: number } | number[] | null | undefined): Segment | null {
  if (!input) return null;
  if (Array.isArray(input)) {
    if (input.length < 2) return null;
    const start = Number(input[0]);
    const end = Number(input[1]);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
    return { start, end };
  }
  const start = Number(input.start);
  const end = Number(input.end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return { start, end };
}

function parseSubtitleTracks(tracks: Array<{ file: string; kind?: string; label?: string; default?: boolean }>): SubtitleItem[] {
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
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [intro, setIntro] = useState<Segment | null>(null);
  const [outro, setOutro] = useState<Segment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (!watchResolveOptions?.streamAnime || !watchResolveOptions.episodeId) {
      setStreamInfo(null);
      setStreamUrl(null);
      setSubtitles([]);
      setThumbnail(null);
      setIntro(null);
      setOutro(null);
      setBuffering(false);
      setError(null);
      setErrorCode(null);
      return;
    }

    const streamAnime = watchResolveOptions.streamAnime;
    const controller = new AbortController();
    const { signal } = controller;
    setError(null);
    setErrorCode(null);
    setBuffering(true);
    setStreamInfo(null);
    setStreamUrl(null);
    setSubtitles([]);
    setThumbnail(null);
    setIntro(null);
    setOutro(null);

    const provider = watchResolveOptions.watchStreamProvider ?? 'kai';
    if (provider === 'anilibria') {
      const matchDone = watchResolveOptions.anilibertyMatchDone;
      const alias = watchResolveOptions.anilibertyAlias?.trim();
      if (!matchDone) {
        /** Чекаємо `/api/anilibria/match` — ефект перезапуститься, коли `anilibertyMatchDone` стане `true`. */
        return () => controller.abort();
      }
      if (!alias) {
        setBuffering(false);
        setErrorCode('anilibria_not_found');
        setError(getErrorMessage(new Error('anilibria_not_found')));
        return () => controller.abort();
      }
    }

    void (async () => {
      try {
        const episodeNumber = Number(watchResolveOptions.episodeId);
        if (!Number.isFinite(episodeNumber) || episodeNumber <= 0) {
          throw new Error('Invalid episode number.');
        }

        if (provider === 'anilibria') {
          const alias = watchResolveOptions.anilibertyAlias?.trim();
          if (!alias) {
            throw new Error('anilibria_missing_alias');
          }
          const streamRes = await fetch(
            `/api/anilibria/stream?${new URLSearchParams({
              alias,
              episode: String(Math.floor(episodeNumber)),
            })}`,
            { signal, headers: { accept: 'application/json' } }
          );
          let body: {
            success?: boolean;
            url?: string;
            intro?: { start: number; end: number } | null;
            outro?: { start: number; end: number } | null;
            error?: string;
          };
          try {
            body = (await streamRes.json()) as typeof body;
          } catch {
            throw new Error('anilibria_stream_failed');
          }
          if (!streamRes.ok || body.success !== true || !body.url?.trim()) {
            const er =
              typeof body.error === 'string' && body.error.trim()
                ? body.error.trim()
                : 'anilibria_stream_failed';
            throw new Error(er);
          }
          const url = body.url.trim();
          if (signal.aborted) return;
          setStreamInfo({
            streamingLink: [
              {
                id: 1,
                type: 'sub',
                link: { file: url, type: 'hls' },
                tracks: [],
                intro: parseSegment(body.intro) ?? { start: 0, end: 0 },
                outro: parseSegment(body.outro) ?? { start: 0, end: 0 },
                server: 'AniLiberty',
              },
            ],
            servers: [],
          });
          setStreamUrl(url);
          setSubtitles([]);
          setThumbnail(null);
          setIntro(parseSegment(body.intro));
          setOutro(parseSegment(body.outro));
          return;
        }

        const tracks = [] as VideoTrack[];
        const resolveParams = {
          anilistId: streamAnime.id?.trim() ? Number(streamAnime.id) : undefined,
          malId:
            typeof streamAnime.mal_id === 'number' && streamAnime.mal_id > 0
              ? streamAnime.mal_id
              : undefined,
          keyword: streamAnime.title,
          localAnimeId: watchResolveOptions.animeId,
          providerAniId: watchResolveOptions.providerAnimeId ?? undefined,
          episode: episodeNumber,
          lang: watchResolveOptions.preferredLang,
        };

        const hadServerHint =
          typeof window !== 'undefined' &&
          Boolean(localStorage.getItem(STORAGE_SERVER_NAME)?.trim());

        let result: Awaited<ReturnType<typeof resolveWatchStream>>;
        try {
          result = await resolveWatchStream(resolveParams, signal);
        } catch (firstErr) {
          if (signal.aborted) return;
          /**
           * Після іншого тайтлу підказка `preferred_server_hint` інколи вказує на недійсне дзеркало
           * для нового каталогу — перший resolve падає, повтор без підказки проходить.
           */
          if (!hadServerHint) throw firstErr;
          try {
            localStorage.removeItem(STORAGE_SERVER_NAME);
          } catch {
            /* ignore */
          }
          result = await resolveWatchStream(resolveParams, signal);
        }

        if (signal.aborted) return;

        const resolvedServerLabel = result.stream.server?.trim();
        if (
          typeof window !== 'undefined' &&
          resolvedServerLabel &&
          resolvedServerLabel !== 'Resolved'
        ) {
          try {
            /**
             * Глобальна підказка для наступних тайтлів: `GET /api/watch/resolve` читає це як
             * `preferred_server_hint` і спочатку пробує той самий «дзеркальний» рядок сервера.
             * Не плутати з link_id — він лише для конкретного епізоду.
             */
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

        if (signal.aborted) return;

        setStreamInfo({
          streamingLink: [
            {
              id: 1,
              type: result.stream.lang,
              link: { file: result.stream.url, type: 'hls' },
              tracks,
              intro: parseSegment(result.stream.intro) ?? { start: 0, end: 0 },
              outro: parseSegment(result.stream.outro) ?? { start: 0, end: 0 },
              server: result.stream.server || 'Resolved',
              request_headers: result.stream.request_headers,
            },
          ],
          servers: [],
        });
        setStreamUrl(result.stream.url);
        const subtitleItems = filterSubtitleTracksByStreamLang(
          parseSubtitleTracks(result.stream.tracks),
          result.stream.lang
        );
        setSubtitles(subtitleItems);
        setThumbnail(getThumbnailTrack(tracks));
        setIntro(parseSegment(result.stream.intro));
        setOutro(parseSegment(result.stream.outro));

        if (resolveParams.lang !== result.stream.lang) {
          watchResolveOptions.onPlaybackLangResolved?.(result.stream.lang);
        }
      } catch (err) {
        if (signal.aborted) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Error resolving watch stream:', err);
        const raw =
          err instanceof Error && typeof err.message === 'string'
            ? err.message.trim()
            : 'unknown';
        setErrorCode(raw);
        setError(getErrorMessage(err));
      } finally {
        if (!signal.aborted) setBuffering(false);
      }
    })();

    return () => controller.abort();
  }, [watchResolveOptions]);

  return {
    streamInfo,
    streamUrl,
    buffering,
    subtitles,
    thumbnail,
    intro,
    outro,
    error,
    errorCode,
  };
}
