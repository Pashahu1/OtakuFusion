import type { StreamingData, StreamingType } from '@/shared/types/StreamingTypes';

const MEGAPLAY_BASE = 'https://megaplay.buzz/stream/s-2';

function getFirstLink(streamInfo: StreamingData | null): StreamingType | null {
  if (!streamInfo?.streamingLink) return null;
  const sl = streamInfo.streamingLink;
  return Array.isArray(sl) ? (sl[0] ?? null) : (sl as unknown as StreamingType);
}

function normalizeType(raw: string | null | undefined): 'sub' | 'dub' {
  const v = (raw ?? '').trim().toLowerCase();
  return v === 'dub' ? 'dub' : 'sub';
}

function replaceIframeLanguage(url: string, type: 'sub' | 'dub'): string {
  return url.replace(/\/(sub|dub)(\/?)(\?|#|$)/i, `/${type}$2$3`);
}

export interface BuildIframeUrlArgs {
  streamInfo: StreamingData | null;
  episodeId: string | null;
  serverType: string | null;
}

export function getIframePlayerUrl({
  streamInfo,
  episodeId,
  serverType,
}: BuildIframeUrlArgs): string | null {
  const desiredType = normalizeType(serverType);
  const fromResponse = getFirstLink(streamInfo)?.iframe?.trim();
  if (fromResponse) return replaceIframeLanguage(fromResponse, desiredType);

  const ep = episodeId?.trim();
  if (!ep) return null;

  return `${MEGAPLAY_BASE}/${encodeURIComponent(ep)}/${desiredType}`;
}
