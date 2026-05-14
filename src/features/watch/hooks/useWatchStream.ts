import { useEffect, useState } from 'react';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { VideoTrack } from '@/shared/types/VideoTrackTypes';
import type { WatchStreamProvider } from '@/lib/watch-provider';
import { resolveWatchStream } from '@/services/resolveWatchStream';
import { STORAGE_SERVER_NAME } from '@/shared/data/servers';

export interface UseWatchStreamReturn {
  streamInfo: StreamingData | null;
  streamUrl: string | null;
  buffering: boolean;
  subtitles: SubtitleItem[];
  thumbnail: string | null;
  error: string | null;
  errorCode: string | null;
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
  preferredLang: 'sub' | 'dub';
  onPlaybackLangResolved?: (lang: 'sub' | 'dub') => void;
  watchStreamProvider: WatchStreamProvider;
  streamRecoveryNonce: number;
}

const WATCH_RESOLVE_UPSTREAM_HINTS: Record<string, string> = {
  'no_working_source|sub_not_available':
    'Не вдалося отримати робочий субтитрований потік для цього епізоду. Спробуйте інший епізод або пізніше.',
  'no_working_source|dub_not_available':
    'Не знайдено робочого дубльованого потоку для цього епізоду. Спробуйте субтитри або інший епізод.',
  no_working_source:
    'Не вдалося відтворити HLS: джерело Animepahe може бути недоступне або змінилося. Спробуйте інший епізод або перемикач Sub/Dub.',
  'lang must be sub or dub':
    'Некоректний параметр мови стріму. Оновіть сторінку або перемкніть Sub/Dub.',
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
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (!watchResolveOptions?.streamAnime || !watchResolveOptions.episodeId) {
      setStreamInfo(null);
      setStreamUrl(null);
      setSubtitles([]);
      setThumbnail(null);
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

    void (async () => {
      try {
        const episodeNumber = Number(watchResolveOptions.episodeId);
        if (!Number.isFinite(episodeNumber) || episodeNumber <= 0) {
          throw new Error('Invalid episode number.');
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
    error,
    errorCode,
  };
}
