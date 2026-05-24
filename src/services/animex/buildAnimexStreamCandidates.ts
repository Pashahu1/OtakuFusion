import type { CrysolineAnimexSourcesPayload } from '@/server/crysoline/animexClient';
import {
  isDeadAnicoreCdnUrl,
  unwrapCrysolinePlaybackUrl,
  urlLooksLikeHlsStream,
} from '@/lib/streamMediaType';
import type { StreamingType } from '@/shared/types/StreamingTypes';
import type { VideoTrack } from '@/shared/types/VideoTrackTypes';

export type WatchLang = 'sub' | 'dub';

function inferLinkType(url: string, apiType?: string): string {
  if (urlLooksLikeHlsStream(url)) return 'hls';
  const u = url.toLowerCase();
  if (u.includes('.mp4') || u.includes('_dnld')) return 'mp4';
  const t = (apiType ?? '').toLowerCase();
  if (t === 'mp4' || t === 'hls') return t;
  return 'hls';
}

function inferQualityLabel(url: string, apiQuality?: string): string {
  const q = apiQuality?.trim();
  if (q) return q;
  const m = url.match(/\/(2160|1440|1080|720|480|360)p(?:\/|$|\?)/i);
  if (m) return `${m[1]}p`;
  return 'Auto';
}

function pickStreamUrl(row: { proxy?: string | null; url?: string | null }): string | null {
  for (const candidate of [row.proxy, row.url]) {
    const raw = candidate?.trim();
    if (!raw) continue;
    if (isDeadAnicoreCdnUrl(raw)) continue;
    const file = unwrapCrysolinePlaybackUrl(raw);
    if (!file || !urlLooksLikeHlsStream(file)) continue;
    return file;
  }
  return null;
}

function mapSubtitlesToTracks(
  subtitles: CrysolineAnimexSourcesPayload['subtitles'],
  lang: WatchLang
): VideoTrack[] {
  if (!Array.isArray(subtitles)) return [];
  const tracks: VideoTrack[] = [];
  for (const row of subtitles) {
    const file = row.url?.trim();
    if (!file) continue;
    const label = row.label?.trim() || row.srcLang?.trim() || 'Subtitle';
    tracks.push({
      file,
      kind: 'subtitles',
      label,
      default: lang === 'sub' && label.toLowerCase().includes('english'),
    });
  }
  return tracks;
}

export function sortAnimexCandidatesForProbe(candidates: StreamingType[]): StreamingType[] {
  return [...candidates].sort((a, b) => {
    const ah = urlLooksLikeHlsStream(a.link.file) ? 1 : 0;
    const bh = urlLooksLikeHlsStream(b.link.file) ? 1 : 0;
    if (ah !== bh) return bh - ah;
    const ha = parseInt((a.server ?? '').match(/(\d{3,4})p/)?.[1] ?? '0', 10);
    const hb = parseInt((b.server ?? '').match(/(\d{3,4})p/)?.[1] ?? '0', 10);
    return hb - ha;
  });
}

export function buildAnimexStreamCandidates(
  payload: CrysolineAnimexSourcesPayload,
  lang: WatchLang,
  serverLabel: string
): StreamingType[] {
  const rootHeaders = payload.headers ?? {};
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  const tracks = mapSubtitlesToTracks(payload.subtitles, lang);
  const out: StreamingType[] = [];
  let nid = 0;

  for (const row of sources) {
    const file = pickStreamUrl(row);
    if (!file) continue;

    nid += 1;
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(rootHeaders)) {
      if (typeof k === 'string' && k.trim() && typeof v === 'string' && v.trim()) {
        headers[k.trim()] = v.trim();
      }
    }
    const qualityLabel = inferQualityLabel(file, row.quality);
    out.push({
      id: nid,
      type: lang === 'dub' ? 'dub' : 'sub',
      link: { file, type: inferLinkType(file, row.type) },
      tracks,
      server: qualityLabel !== 'Auto' ? qualityLabel : serverLabel || 'Animex',
      request_headers: Object.keys(headers).length ? headers : undefined,
    });
  }

  return sortAnimexCandidatesForProbe(out);
}
