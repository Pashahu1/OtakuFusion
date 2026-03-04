import { useState, useEffect, useRef } from 'react';
import getStreamInfo from '@/services/getStreamInfo.services';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { StreamingType } from '@/shared/types/StreamingTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

export interface UseWatchStreamReturn {
  streamInfo: StreamingData | null;
  streamUrl: string | null;
  buffering: boolean;
  subtitles: Array<{ file: string; label: string }>;
  thumbnail: string | null;
  intro: { start: number; end: number } | null;
  outro: { start: number; end: number } | null;
  error: string | null;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An error occurred.';
}

/** API can return streamingLink as single object or array — support both (same as original useWatch). */
function getFirstStreamLink(data: StreamingData | null): StreamingType | null {
  if (!data?.streamingLink) return null;
  const sl = data.streamingLink;
  return Array.isArray(sl) ? (sl[0] ?? null) : sl;
}

export function useWatchStream(
  animeId: string,
  episodeId: string | null,
  activeServerId: string | null,
  servers: ServerInfo[] | null
): UseWatchStreamReturn {
  const [streamInfo, setStreamInfo] = useState<StreamingData | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [buffering, setBuffering] = useState(true);
  const [subtitles, setSubtitles] = useState<Array<{ file: string; label: string }>>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [intro, setIntro] = useState<{ start: number; end: number } | null>(null);
  const [outro, setOutro] = useState<{ start: number; end: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isFetchInProgress = useRef(false);

  useEffect(() => {
    if (
      !episodeId ||
      !activeServerId ||
      !servers?.length ||
      isFetchInProgress.current
    ) {
      if (!episodeId || !activeServerId) {
        setStreamInfo(null);
        setStreamUrl(null);
        setSubtitles([]);
        setThumbnail(null);
        setIntro(null);
        setOutro(null);
        setBuffering(false);
      }
      return;
    }

    const server = servers.find((s) => String(s.data_id) === String(activeServerId));
    if (!server) {
      setError('No server found with the activeServerId.');
      setBuffering(false);
      return;
    }

    const fetchStream = async () => {
      isFetchInProgress.current = true;
      setBuffering(true);
      try {
        const data = await getStreamInfo(
          animeId,
          episodeId,
          server.serverName.toLowerCase(),
          server.type.toLowerCase()
        );
        setStreamInfo(data);
        const first = getFirstStreamLink(data);
        if (first) {
          setStreamUrl(first.link?.file ?? null);
          setIntro(first.intro ?? null);
          setOutro(first.outro ?? null);
          const subs =
            first.tracks
              ?.filter((t) => t.kind === 'captions')
              .map((t) => ({ file: t.file, label: t.label })) ?? [];
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
      } catch (err) {
        console.error('Error fetching stream info:', err);
        setError(getErrorMessage(err));
      } finally {
        setBuffering(false);
        isFetchInProgress.current = false;
      }
    };
    fetchStream();
  }, [animeId, episodeId, activeServerId, servers]);

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
