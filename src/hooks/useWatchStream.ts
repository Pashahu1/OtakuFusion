import { useState, useEffect } from 'react';
import { getStreamInfo } from '@/services/getStreamInfo';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { StreamingType } from '@/shared/types/StreamingTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { Segment } from '@/shared/types/VideoSegmentsTypes';

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

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An error occurred.';
}

function getFirstStreamLink(data: StreamingData | null): StreamingType | null {
  if (!data?.streamingLink) return null;
  const sl = data.streamingLink;
  if (!Array.isArray(sl)) return sl;
  if (sl.length === 0) return null;

  const blockedHosts = ['watching.onl', 'mewstream.buzz'];
  const byQuality = sl.find((stream) => {
    const file = stream?.link?.file ?? '';
    return file.includes('master.m3u8') && !blockedHosts.some((host) => file.includes(host));
  });
  if (byQuality) return byQuality;

  const byHost = sl.find((stream) => {
    const file = stream?.link?.file ?? '';
    return !blockedHosts.some((host) => file.includes(host));
  });
  if (byHost) return byHost;

  return sl[0] ?? null;
}

export function useWatchStream(
  providerAnimeId: string | null,
  episodeId: string | null,
  activeServerId: string | null,
  servers: ServerInfo[] | null,
  setActiveServerId?: (id: string | null) => void
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
    if (!providerAnimeId || !episodeId || !activeServerId || !servers?.length) {
      if (!providerAnimeId || !episodeId || !activeServerId) {
        setStreamInfo(null);
        setStreamUrl(null);
        setSubtitles([]);
        setThumbnail(null);
        setIntro(null);
        setOutro(null);
        setBuffering(false);
        setError(null);
      }
      return;
    }

    const activeServer = servers.find(
      (s) => String(s.data_id) === String(activeServerId)
    );
    if (!activeServer) {
      setError('No server found with the activeServerId.');
      setBuffering(false);
      return;
    }

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

    const fetchStream = async () => {
      try {
        const fallbackType = activeServer.type === 'dub' ? 'sub' : 'dub';
        const candidates = [
          activeServer,
          ...servers.filter(
            (server) =>
              String(server.data_id) !== String(activeServer.data_id) &&
              server.type === fallbackType
          ),
          ...servers.filter(
            (server) =>
              String(server.data_id) !== String(activeServer.data_id) &&
              server.type !== fallbackType
          ),
        ];

        let resolved = false;
        let lastError: unknown;

        for (const serverCandidate of candidates) {
          try {
            const data = await getStreamInfo(
              providerAnimeId,
              episodeId,
              serverCandidate,
              serverCandidate.type.toLowerCase(),
              signal
            );
            if (signal.aborted) return;

            setStreamInfo(data);
            const first = getFirstStreamLink(data);
            if (first) {
              setStreamUrl(first.link?.file ?? null);
              setIntro(first.intro ?? null);
              setOutro(first.outro ?? null);
              const subs: SubtitleItem[] =
                first.tracks
                  ?.filter((t) => t.kind === 'captions')
                  .map((t) => ({
                    file: t.file,
                    label: t.label,
                    ...(t.default !== undefined && { default: t.default }),
                  })) ?? [];
              setSubtitles(subs);
              const thumb = first.tracks?.find(
                (t) => t.kind === 'thumbnails' && t.file
              );
              setThumbnail(thumb?.file ?? null);
            } else {
              setStreamUrl(null);
              setSubtitles([]);
              setThumbnail(null);
              setIntro(null);
              setOutro(null);
            }

            if (
              setActiveServerId &&
              String(serverCandidate.data_id) !== String(activeServerId)
            ) {
              setActiveServerId(String(serverCandidate.data_id));
            }
            resolved = true;
            break;
          } catch (error) {
            lastError = error;
          }
        }

        if (!resolved) {
          throw lastError instanceof Error
            ? lastError
            : new Error('Stream unavailable');
        }
      } catch (err) {
        if (signal.aborted) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Error fetching stream info:', err);
        setError(getErrorMessage(err));
      } finally {
        if (!signal.aborted) setBuffering(false);
      }
    };
    fetchStream();

    return () => controller.abort();
  }, [providerAnimeId, episodeId, activeServerId, servers, setActiveServerId]);

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
