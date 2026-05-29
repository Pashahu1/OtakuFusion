export {
  buildProbeHeaders,
  isPlayableViaProxy,
  readWatchProbeConfig,
  type WatchProbeConfig,
  type WatchProbeRequestLang,
} from '@/lib/watchResolveProbe';

import { isPlayableViaProxy, type WatchProbeConfig } from '@/lib/watchResolveProbe';
import {
  dedupeStreamingCandidatesByHeight,
  resolutionRank,
} from '@/server/watch-resolve/candidates';
import type { WatchLang } from '@/server/watch-resolve/types';
import type { StreamingType } from '@/shared/types/StreamingTypes';

const PREFERRED_PROBE_HEIGHT = 720;

async function tryResolveStreamingCandidate(
  stream: StreamingType,
  origin: string,
  probeCfg: WatchProbeConfig
): Promise<StreamingType> {
  const ok = await isPlayableViaProxy(origin, stream, probeCfg);
  if (!ok) throw new Error('not_playable');
  return stream;
}

function readMaxProbeCandidates(lang: WatchLang): number {
  const raw = Number(process.env.WATCH_RESOLVE_MAX_PROBE_CANDIDATES);
  if (Number.isFinite(raw) && raw >= 1 && raw <= 8) return Math.floor(raw);
  return lang === 'dub' ? 3 : 4;
}

function orderCandidatesForProbe(
  candidates: StreamingType[],
  lang: WatchLang
): StreamingType[] {
  const deduped = dedupeStreamingCandidatesByHeight(candidates);
  const ranked = [...deduped].sort((a, b) => {
    const ha = resolutionRank(a.server);
    const hb = resolutionRank(b.server);
    const da = Math.abs(ha - PREFERRED_PROBE_HEIGHT);
    const db = Math.abs(hb - PREFERRED_PROBE_HEIGHT);
    if (da !== db) return da - db;
    return hb - ha;
  });
  return ranked.slice(0, readMaxProbeCandidates(lang));
}

/** Template-method step: probe candidates until one plays via proxy. */
export async function resolveFirstWorkingStreamCandidate(
  candidates: StreamingType[],
  origin: string,
  probeCfg: WatchProbeConfig,
  lang: WatchLang
): Promise<StreamingType> {
  const toTry = orderCandidatesForProbe(candidates, lang);
  if (!toTry.length) throw new Error('no_working_source');

  let lastErr: unknown = null;
  for (const c of toTry) {
    try {
      return await tryResolveStreamingCandidate(c, origin, probeCfg);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('no_working_source');
}
