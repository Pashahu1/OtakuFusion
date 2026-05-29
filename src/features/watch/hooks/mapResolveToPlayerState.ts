import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData, StreamQualityVariant } from '@/shared/types/StreamingTypes';
import type { VideoTrack } from '@/shared/types/VideoTrackTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { WatchResolveResponse } from '@/features/watch/lib/resolve-watch-stream';
import { pickPreferredQualityVariant } from '@/features/player/ui/pickPreferredStreamQuality';
import { inferStreamMediaKind, urlLooksLikeHlsStream } from '@/lib/streamMediaType';
import {
  heightFromAnilibertyServerLabel,
  writeAnilibertyPlaybackQualityHint,
} from '@/shared/utils/anilibertyPlaybackQualityHint';

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
  params: MapResolveToPlayerStateParams
): MappedWatchPlayerState {
  const { result, watchStreamProvider } = params;

  const tracks: VideoTrack[] = [];
  const resolvedServerLabel = result.stream.server?.trim();

  if (typeof window !== 'undefined' && watchStreamProvider === 'aniliberty') {
    try {
      const h = heightFromAnilibertyServerLabel(resolvedServerLabel ?? '');
      if (h != null) writeAnilibertyPlaybackQualityHint(h);
    } catch {

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
    result.stream.lang
  );

  return {
    streamInfo,
    streamUrl: playbackUrl,
    subtitles: subtitleItems,
    thumbnail: getThumbnailTrack(tracks),
    resolvedStreamLang: result.stream.lang,
  };
}

export interface ApplyResolveSuccessContext {
  resolveOptsRef: MutableRefObject<
    | {
        streamLangRevision?: number;
        preferredLang?: 'sub' | 'dub';
        onPlaybackLangResolved?: (lang: 'sub' | 'dub') => void;
      }
    | undefined
  >;
  resolveLangRevision: number;
  watchStreamProvider: WatchStreamProvider;
  setStreamInfo: Dispatch<SetStateAction<StreamingData | null>>;
  setStreamUrl: Dispatch<SetStateAction<string | null>>;
  setSubtitles: Dispatch<SetStateAction<SubtitleItem[]>>;
  setThumbnail: Dispatch<SetStateAction<string | null>>;
}

export function applyResolveSuccess(
  result: WatchResolveResponse,
  resolveParams: { lang: 'sub' | 'dub' },
  ctx: ApplyResolveSuccessContext
): void {
  const opts = ctx.resolveOptsRef.current;
  if (opts?.streamLangRevision !== ctx.resolveLangRevision) return;
  if (opts?.preferredLang !== resolveParams.lang) return;

  const mapped = mapResolveToPlayerState({
    result,
    watchStreamProvider: ctx.watchStreamProvider,
  });

  ctx.setStreamInfo(mapped.streamInfo);
  ctx.setStreamUrl(mapped.streamUrl);
  ctx.setSubtitles(mapped.subtitles);
  ctx.setThumbnail(mapped.thumbnail);

  if (resolveParams.lang !== mapped.resolvedStreamLang) {
    if (resolveParams.lang === 'dub' && mapped.resolvedStreamLang === 'sub') {
      return;
    }
    if (opts?.preferredLang !== resolveParams.lang) return;
    opts?.onPlaybackLangResolved?.(mapped.resolvedStreamLang);
  }
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
