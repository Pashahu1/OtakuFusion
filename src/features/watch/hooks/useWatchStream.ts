import { useEffect, useState } from 'react';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { VideoTrack } from '@/shared/types/VideoTrackTypes';
import type { Segment } from '@/shared/types/VideoSegmentsTypes';
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
}

interface WatchResolveOptions {
  animeId: string;
  episodeId: string | null;
  animeInfo: AnimeData | null;
  providerAnimeId?: string | null;
  preferredLang: 'sub' | 'dub';
  /** Після успішного резолву — синхронізувати перемикач Sub/Dub із реальною доріжкою (`stream.lang`). */
  onPlaybackLangResolved?: (lang: 'sub' | 'dub') => void;
}

/** Відомі коди помилок GET /api/watch/resolve на бекенді AnimeKai (не з нашого коду). */
const WATCH_RESOLVE_UPSTREAM_HINTS: Record<string, string> = {
  'no_working_source|sub_not_available':
    'AnimeKai / резолвер не віддав робочий саб для цього епізоду (sub_not_available). Спробуйте Dub, інший епізод або пізніше — зазвичай це зміна сайту, лінків або зовнішнього розшифрування, а не вашого коду.',
  'no_working_source|dub_not_available':
    'Для цього епізоду не знайдено робочого дубу (dub_not_available). Спробуйте Sub або інший епізод.',
  no_working_source:
    'Бекенд не зміг отримати робоче відео (HLS): джерело на AnimeKai недоступне, зламане шифрування або змінився сайт. Спробуйте інший епізод, перемкніть Sub/Dub або повторіть пізніше.',
  'lang must be sub or dub':
    'Некоректний параметр мови стріму. Оновіть сторінку або перемкніть Sub/Dub.',
};

function getErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'Сталася помилка.';
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

  useEffect(() => {
    if (!watchResolveOptions?.animeInfo || !watchResolveOptions.episodeId) {
      setStreamInfo(null);
      setStreamUrl(null);
      setSubtitles([]);
      setThumbnail(null);
      setIntro(null);
      setOutro(null);
      setBuffering(false);
      setError(null);
      return;
    }

    const animeInfo = watchResolveOptions.animeInfo;
    const controller = new AbortController();
    const { signal } = controller;
    setError(null);
    setBuffering(true);
    setStreamInfo(null);
    setStreamUrl(null);
    setSubtitles([]);
    setThumbnail(null);
    setIntro(null);
    setOutro(null);

    void (async () => {
      try {
        const episodeNumber = Number(watchResolveOptions.episodeId);
        if (!Number.isFinite(episodeNumber) || episodeNumber <= 0) {
          throw new Error('Invalid episode number.');
        }

        const tracks = [] as VideoTrack[];
        const resolveParams = {
          anilistId: animeInfo.id?.trim() ? Number(animeInfo.id) : undefined,
          malId:
            typeof animeInfo.mal_id === 'number' && animeInfo.mal_id > 0
              ? animeInfo.mal_id
              : undefined,
          keyword: animeInfo.title,
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
  };
}
