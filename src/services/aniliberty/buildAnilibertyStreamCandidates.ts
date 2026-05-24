import type {
  CrysolineAnilibertyEpisodeRow,
  CrysolineAnilibertySourcesPayload,
} from '@/server/crysoline/anilibertyClient';
import type { StreamingType } from '@/shared/types/StreamingTypes';
import { urlLooksLikeHlsStream } from '@/lib/streamMediaType';

export const ANILIBRIA_STREAM_HEADERS: Record<string, string> = {
  Referer: 'https://www.anilibria.tv/',
  Origin: 'https://www.anilibria.tv',
};

function inferAnilibertyResolutionLabel(urlStr: string): string {
  const m = urlStr.match(/\/(480|720|1080)\//);
  if (m) return `${m[1]}p`;
  return 'Auto';
}

function resolutionRank(label: string): number {
  const m = label.match(/(\d{3,4})p/i);
  return m ? parseInt(m[1], 10) : 0;
}

function pushCandidate(
  out: StreamingType[],
  file: string,
  label: string,
  nid: { current: number }
): void {
  const url = file.trim();
  if (!url) return;
  nid.current += 1;
  out.push({
    id: nid.current,
    type: 'sub',
    link: { file: url, type: 'hls' },
    tracks: [],
    server: `${label} · Anilibria`,
    request_headers: { ...ANILIBRIA_STREAM_HEADERS },
  });
}

/** Прямі HLS з metadata епізоду (Crysoline `/episodes`) — без другого запиту `/sources`. */
export function buildAnilibertyStreamCandidatesFromEpisodeRow(
  row: CrysolineAnilibertyEpisodeRow | null | undefined
): StreamingType[] {
  const meta = row?.metadata;
  if (!meta) return [];

  const tiers: Array<{ url?: string | null; label: string }> = [
    { url: meta.hls_1080, label: '1080p' },
    { url: meta.hls_720, label: '720p' },
    { url: meta.hls_480, label: '480p' },
  ];

  const out: StreamingType[] = [];
  const nid = { current: 0 };
  for (const tier of tiers) {
    const file = tier.url?.trim();
    if (!file || !urlLooksLikeHlsStream(file)) continue;
    pushCandidate(out, file, tier.label, nid);
  }

  return [...out].sort(
    (a, b) => resolutionRank(b.server) - resolutionRank(a.server)
  );
}

export function buildAnilibertyStreamCandidatesFromSources(
  payload: CrysolineAnilibertySourcesPayload
): StreamingType[] {
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  const rows = sources.filter((s) => {
    const file = typeof s.url === 'string' ? s.url.trim() : '';
    if (!file) return false;
    const t = (s.type ?? '').trim().toLowerCase();
    if (t === 'hls' || t === 'm3u8') return true;
    return urlLooksLikeHlsStream(file);
  });

  const scored = rows.map((s) => {
    const file = s.url!.trim();
    const label = inferAnilibertyResolutionLabel(file);
    return { file, label, rank: resolutionRank(label) };
  });
  const sorted = [...scored].sort((a, b) => b.rank - a.rank);
  const out: StreamingType[] = [];
  const nid = { current: 0 };
  for (const row of sorted) {
    pushCandidate(out, row.file, row.label, nid);
  }
  return out;
}
