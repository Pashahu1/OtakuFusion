import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { VideoTrack } from '@/shared/types/VideoTrackTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { WatchResolveResponse } from '@/features/watch/lib/resolve-watch-stream';
import { pickPreferredQualityVariant } from '@/features/player/ui/pickPreferredStreamQuality';
import { inferStreamMediaKind, urlLooksLikeHlsStream } from '@/lib/streamMediaType';
import {
  heightFromAnilibertyServerLabel,
  writeAnilibertyPlaybackQualityHint,
} from '@/shared/utils/anilibertyPlaybackQualityHint';

import { normalizeQualityVariantsFromResolve } from './qualityVariants';
import {
  filterSubtitleTracksByStreamLang,
  getThumbnailTrack,
  parseSubtitleTracks,
} from './subtitleTracks';

export interface MappedWatchPlayerState {
  streamInfo: StreamingData;
  streamUrl: string;
  subtitles: SubtitleItem[];
  thumbnail: string | null;
  resolvedStreamLang: 'sub' | 'dub';
}

export interface MapResolveToPlayerStateParams {
  result: WatchResolveResponse;
  watchStreamProvider: WatchStreamProvider;
}

export function mapResolveToPlayerState(
  params: MapResolveToPlayerStateParams,
): MappedWatchPlayerState {
  const { result, watchStreamProvider } = params;

  const tracks: VideoTrack[] = [];
  const resolvedServerLabel = result.stream.server?.trim();

  if (typeof window !== 'undefined' && watchStreamProvider === 'aniliberty') {
    try {
      const h = heightFromAnilibertyServerLabel(resolvedServerLabel ?? '');
      if (h != null) writeAnilibertyPlaybackQualityHint(h);
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

  const qualityVariants = normalizeQualityVariantsFromResolve(result.quality_variants);
  const preferredPlayback = pickPreferredQualityVariant(qualityVariants, result.stream.url);
  const playbackUrl = preferredPlayback.url;
  const playbackHeaders =
    preferredPlayback.request_headers ?? result.stream.request_headers;
  const resolvedFormat =
    result.stream.format === 'mp4' || result.stream.format === 'hls'
      ? result.stream.format
      : inferStreamMediaKind(playbackUrl);
  const playbackFormat = urlLooksLikeHlsStream(playbackUrl) ? 'hls' : resolvedFormat;

  const streamInfo: StreamingData = {
    streamingLink: [
      {
        id: 1,
        type: result.stream.lang,
        link: { file: playbackUrl, type: playbackFormat },
        tracks,
        server: result.stream.server || 'Resolved',
        request_headers: playbackHeaders,
      },
    ],
    servers: [],
    skipSegments: result.segments,
    qualityVariants,
  };

  const subtitleItems = filterSubtitleTracksByStreamLang(
    parseSubtitleTracks(result.stream.tracks),
    result.stream.lang,
  );

  return {
    streamInfo,
    streamUrl: playbackUrl,
    subtitles: subtitleItems,
    thumbnail: getThumbnailTrack(tracks),
    resolvedStreamLang: result.stream.lang,
  };
}
