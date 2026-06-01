import { buildProbeHeaders } from '@/lib/watchResolveProbe';
import { streamQualityRank } from '@/lib/streamQualityRank';
import { urlIsCrysolineHostedStream } from '@/lib/streamMediaType';
import type { StreamingType } from '@/shared/types/StreamingTypes';

export function dedupeStreamingCandidatesByHeight(candidates: StreamingType[]): StreamingType[] {
  const map = new Map<number, StreamingType>();
  for (const c of candidates) {
    const h = streamQualityRank(c.server);
    if (!Number.isFinite(h) || h <= 0) continue;
    const prev = map.get(h);
    if (!prev) {
      map.set(h, c);
      continue;
    }
    const prevProxy = urlIsCrysolineHostedStream(prev.link.file);
    const curProxy = urlIsCrysolineHostedStream(c.link.file);
    if (curProxy && !prevProxy) map.set(h, c);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, v]) => v);
}

export function qualityVariantsFromCandidates(
  candidates: StreamingType[]
): Array<{
  height: number;
  label: string;
  url: string;
  request_headers: Record<string, string>;
}> {
  const rows = dedupeStreamingCandidatesByHeight(candidates);
  const out: Array<{
    height: number;
    label: string;
    url: string;
    request_headers: Record<string, string>;
  }> = [];
  for (const c of rows) {
    const h = streamQualityRank(c.server);
    if (!Number.isFinite(h) || h <= 0) continue;
    out.push({
      height: h,
      label: (c.server ?? '').trim() || `${h}p`,
      url: c.link.file.trim(),
      request_headers: buildProbeHeaders(c),
    });
  }
  return out;
}

export function prioritizeByServerHint(
  candidates: StreamingType[],
  hint: string | null | undefined
): StreamingType[] {
  const raw = hint?.trim();
  if (!raw) return candidates;
  const h = raw.toLowerCase();
  const match = candidates.filter((c) => c.server.toLowerCase().includes(h));
  const rest = candidates.filter((c) => !c.server.toLowerCase().includes(h));
  return [...match, ...rest];
}

export function inferStreamFormat(primary: StreamingType): 'hls' | 'mp4' {
  const file = primary.link.file?.trim() ?? '';
  if (file && /\.m3u8|mpegurl|\/hls\//i.test(file)) return 'hls';
  const t = primary.link.type;
  return t === 'mp4' || t === 'hls' ? t : 'hls';
}
