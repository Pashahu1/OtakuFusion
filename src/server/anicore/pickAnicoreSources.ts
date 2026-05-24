import 'server-only';

import type { CrysolineAnicoreEpisodeRow } from '@/server/crysoline/anicoreClient';
import { getAnicoreSourcesCached } from '@/server/anicore/sourcesCached';
import { buildAnicoreStreamCandidates } from '@/services/anicore/buildAnicoreStreamCandidates';
import type { StreamingType } from '@/shared/types/StreamingTypes';
import type { WatchProbeConfig, WatchProbeRequestLang } from '@/lib/watchResolveProbe';
import { isDeadAnicoreCdnUrl, urlLooksLikeHlsStream } from '@/lib/streamMediaType';
import {
  isValidAnicorePlaybackServerHint,
  normalizeAnicorePlaybackServerId,
} from '@/shared/utils/anicorePlaybackServerHint';
import { isPlayableStreamViaProxy, probeHlsStreamViaProxy } from '@/lib/watchResolveProbe';

export interface AnicoreSourcesPickResult {
  server: string;
  payload: Awaited<ReturnType<typeof getAnicoreSourcesCached>>;
  candidates: StreamingType[];

  verifiedCandidate: StreamingType;
}

const DEFAULT_ANICORE_SUB_SERVERS = ['mimi', 'uwu', 'mochi', 'yuki'] as const;
const DEFAULT_ANICORE_DUB_SERVERS = ['miku', 'mimi', 'uwu', 'mochi', 'yuki'] as const;
const ANICORE_DUB_PLAYBACK_SERVER = 'miku';

function providerListForLang(
  row: CrysolineAnicoreEpisodeRow | null,
  lang: WatchProbeRequestLang
): string[] {
  const forced = process.env.ANICORE_PLAYBACK_SERVER?.trim();
  if (forced) return [normalizeAnicorePlaybackServerId(forced)];

  const seen = new Set<string>();
  const out: string[] = [];
  const push = (raw: string) => {
    const id = normalizeAnicorePlaybackServerId(raw);
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push(id);
  };

  const metaList =
    lang === 'dub' ? row?.metadata?.dubProviders : row?.metadata?.subProviders;
  if (Array.isArray(metaList)) {
    for (const id of metaList) {
      if (typeof id === 'string') push(id);
    }
  }

  if (lang === 'dub') {
    const dubPreferred = normalizeAnicorePlaybackServerId(
      process.env.ANICORE_DUB_PLAYBACK_SERVER?.trim() || ANICORE_DUB_PLAYBACK_SERVER
    );
    if (dubPreferred) push(dubPreferred);
    for (const id of DEFAULT_ANICORE_DUB_SERVERS) push(id);
  } else {
    for (const id of DEFAULT_ANICORE_SUB_SERVERS) push(id);
  }

  return out;
}

function sourcesPayloadHasStream(
  payload: Awaited<ReturnType<typeof getAnicoreSourcesCached>>
): boolean {
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  return sources.some((s) => {
    const u = (s.proxy ?? s.url)?.trim();
    return Boolean(u);
  });
}

async function candidatePassesProbe(
  origin: string,
  candidate: StreamingType,
  probeCfg: WatchProbeConfig
): Promise<boolean> {
  const file = candidate.link?.file?.trim();
  if (!file || isDeadAnicoreCdnUrl(file)) return false;

  const linkType = candidate.link?.type?.trim().toLowerCase();
  const treatAsHls =
    linkType === 'hls' || (linkType !== 'mp4' && urlLooksLikeHlsStream(file));

  try {
    if (treatAsHls) {
      return (await probeHlsStreamViaProxy(origin, candidate, probeCfg)).ok;
    }
    return await isPlayableStreamViaProxy(origin, candidate, probeCfg);
  } catch {
    return false;
  }
}

async function pickOnServer(params: {
  server: string;
  seriesId: string;
  episodeId: string;
  lang: WatchProbeRequestLang;
  origin: string;
  probeCfg: WatchProbeConfig;
  isCancelled: () => boolean;
}): Promise<AnicoreSourcesPickResult | null> {
  const { server, seriesId, episodeId, lang, origin, probeCfg, isCancelled } =
    params;

  if (isCancelled()) return null;

  let payload: Awaited<ReturnType<typeof getAnicoreSourcesCached>>;
  try {
    payload = await getAnicoreSourcesCached(seriesId, episodeId, server, lang);
  } catch {
    return null;
  }

  if (isCancelled() || !sourcesPayloadHasStream(payload)) return null;

  const candidates = buildAnicoreStreamCandidates(payload, lang, server);
  if (!candidates.length) return null;

  for (const candidate of candidates) {
    if (isCancelled()) return null;
    const ok = await candidatePassesProbe(origin, candidate, probeCfg);
    if (ok) {
      return { server, payload, candidates, verifiedCandidate: candidate };
    }
  }

  return null;
}

function firstSuccessful<T>(
  tasks: Array<() => Promise<T | null>>
): Promise<T | null> {
  if (!tasks.length) return Promise.resolve(null);

  return new Promise((resolve) => {
    let remaining = tasks.length;
    let settled = false;

    const finish = (value: T | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    for (const task of tasks) {
      void task()
        .then((value) => {
          if (value != null) {
            finish(value);
            return;
          }
          remaining -= 1;
          if (remaining === 0) finish(null);
        })
        .catch(() => {
          remaining -= 1;
          if (!settled && remaining === 0) finish(null);
        });
    }
  });
}

function dubProbeLikelyFutile(
  row: CrysolineAnicoreEpisodeRow | null,
  lang: WatchProbeRequestLang,
  episodeHasDub?: boolean | null
): boolean {
  if (lang !== 'dub') return false;
  if (episodeHasDub === true) return false;
  const list = row?.metadata?.dubProviders;
  return !Array.isArray(list) || list.length === 0;
}

export async function pickAnicoreSourcesWithProbe(params: {
  seriesId: string;
  episodeId: string;
  episodeRow: CrysolineAnicoreEpisodeRow | null;
  lang: WatchProbeRequestLang;
  origin: string;
  probeCfg: WatchProbeConfig;
  preferredServerHint?: string | null;
  episodeHasDub?: boolean | null;
}): Promise<AnicoreSourcesPickResult | null> {
  const {
    seriesId,
    episodeId,
    episodeRow,
    lang,
    origin,
    probeCfg,
    preferredServerHint,
    episodeHasDub,
  } = params;

  if (dubProbeLikelyFutile(episodeRow, lang, episodeHasDub)) {
    return null;
  }

  const hintRaw = preferredServerHint?.trim();
  const hintId =
    hintRaw && isValidAnicorePlaybackServerHint(hintRaw)
      ? normalizeAnicorePlaybackServerId(hintRaw)
      : null;

  if (hintId) {
    const fast = await pickOnServer({
      server: hintId,
      seriesId,
      episodeId,
      lang,
      origin,
      probeCfg,
      isCancelled: () => false,
    });
    if (fast) return fast;
  }

  const allServers = providerListForLang(episodeRow, lang);
  const parallelServers = hintId
    ? allServers.filter((s) => s !== hintId)
    : allServers;
  if (!parallelServers.length) return null;

  let won = false;
  const isCancelled = () => won;

  const tasks = parallelServers.map(
    (server) => () =>
      pickOnServer({
        server,
        seriesId,
        episodeId,
        lang,
        origin,
        probeCfg,
        isCancelled,
      }).then((result) => {
        if (result) won = true;
        return result;
      })
  );

  return firstSuccessful(tasks);
}
