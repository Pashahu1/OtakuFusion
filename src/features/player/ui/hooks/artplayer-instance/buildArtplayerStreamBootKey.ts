import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

export interface BuildStreamBootKeyParams {
  watchStreamProvider: WatchStreamProvider;
  streamUrl: string;
  thumbnail?: string | null;
  subtitles?: SubtitleItem[] | null;
  streamInfo?: StreamingData | null;
}

/** Stable remount key: provider, URL, subs, skip segments, quality variants. */
export function buildArtplayerStreamBootKey({
  watchStreamProvider,
  streamUrl,
  thumbnail,
  subtitles,
  streamInfo,
}: BuildStreamBootKeyParams): string {
  const subKey = (subtitles ?? [])
    .map((s) => `${String(s.file ?? '').trim()}\t${String(s.label ?? '').trim()}`)
    .join('\n');
  const seg = streamInfo?.skipSegments;
  const qv = streamInfo?.qualityVariants;
  const qvKey = qv?.length ? qv.map((q) => `${q.height}:${q.url}`).join('|') : '';
  const segKey = seg
    ? [
        seg.intro ? `${seg.intro.start}-${seg.intro.end}` : '',
        seg.outro ? `${seg.outro.start}-${seg.outro.end}` : '',
      ].join('|')
    : '';
  return [watchStreamProvider, streamUrl, thumbnail ?? '', subKey, segKey, qvKey].join('\f');
}
