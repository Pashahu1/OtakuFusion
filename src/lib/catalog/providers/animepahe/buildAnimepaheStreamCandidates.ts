import type {
  CrysolineAnimepaheSourceRow,
  CrysolineAnimepaheSourcesPayload,
} from '@/server/crysoline/animepaheClient';
import { inferAnimepaheSourceIsDub } from '@/lib/catalog/providers/animepahe/inferAnimepaheSourceIsDub';
import { streamQualityRank } from '@/lib/streamQualityRank';
import type { StreamingType } from '@/shared/types/StreamingTypes';

export type WatchLang = 'sub' | 'dub';

function mergeRootHeaders(
  root: Record<string, string> | undefined
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!root) return out;
  for (const [k, v] of Object.entries(root)) {
    if (typeof k !== 'string' || !k.trim()) continue;
    if (typeof v !== 'string' || !v.trim()) continue;
    out[k.trim()] = v.trim();
  }
  return out;
}

export function buildAnimepaheStreamCandidates(
  payload: CrysolineAnimepaheSourcesPayload,
  requestedLang: WatchLang
): StreamingType[] {
  const rootHeaders = mergeRootHeaders(payload.headers);
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  const filtered = sources.filter((s: CrysolineAnimepaheSourceRow) => {
    const isDub = inferAnimepaheSourceIsDub(s);
    if (requestedLang === 'dub') return isDub;
    return !isDub;
  });
  const list = filtered.length ? filtered : sources;
  const sorted = [...list].sort(
    (a, b) => streamQualityRank(b.quality) - streamQualityRank(a.quality)
  );
  const out: StreamingType[] = [];
  let nid = 0;
  for (const row of sorted) {
    const headers = { ...rootHeaders };
    const file = row.proxy?.trim() || row.url?.trim();
    if (!file) continue;
    nid += 1;
    out.push({
      id: nid,
      type: inferAnimepaheSourceIsDub(row) ? ('dub' as const) : ('sub' as const),
      link: { file, type: 'hls' },
      tracks: [],
      server: row.quality?.trim() || 'Animepahe',
      request_headers: Object.keys(headers).length ? headers : undefined,
    });
  }
  return out;
}
