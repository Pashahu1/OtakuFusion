import 'server-only';

import type { AnimexSubType, CrysolineAnimexEpisodeRow } from '@/server/crysoline/animexClient';
import { watchLangToAnimexSubTypes } from '@/server/crysoline/animexClient';
import { getAnimexSourcesCached } from '@/server/animex/sourcesCached';
import { buildAnimexStreamCandidates } from '@/services/animex/buildAnimexStreamCandidates';
import type { StreamingType } from '@/shared/types/StreamingTypes';
import type { WatchProbeConfig, WatchProbeRequestLang } from '@/lib/watchResolveProbe';
import { isDeadAnicoreCdnUrl, urlLooksLikeHlsStream } from '@/lib/streamMediaType';
import {
  isValidAnimexPlaybackServerHint,
  normalizeAnimexPlaybackServerId,
} from '@/shared/utils/animexPlaybackServerHint';
import { isPlayableStreamViaProxy, probeHlsStreamViaProxy } from '@/lib/watchResolveProbe';

export interface AnimexSourcesPickResult {
  server: string;
  subType: AnimexSubType;
  payload: Awaited<ReturnType<typeof getAnimexSourcesCached>>;
  candidates: StreamingType[];
  verifiedCandidate: StreamingType;
}

const DEFAULT_ANIMEX_PLAYBACK_SERVERS = [
  'mimi',
  'uwu',
  'mochi',
  'miku',
  'yuki',
] as const;

function providerListForLang(
  row: CrysolineAnimexEpisodeRow | null,
  lang: WatchProbeRequestLang
): string[] {
  const forced =
    process.env.ANIMEX_PLAYBACK_SERVER?.trim() ||
    process.env.ANICORE_PLAYBACK_SERVER?.trim();
  if (forced) return [normalizeAnimexPlaybackServerId(forced)];

  const seen = new Set<string>();
  const out: string[] = [];
  const push = (raw: string) => {
    const id = normalizeAnimexPlaybackServerId(raw);
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

  for (const id of DEFAULT_ANIMEX_PLAYBACK_SERVERS) push(id);

  return out;
}

function sourcesPayloadHasStream(
  payload: Awaited<ReturnType<typeof getAnimexSourcesCached>>
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

async function pickOnServerSubType(params: {
  server: string;
  subType: AnimexSubType;
  seriesId: string;
  episodeId: string;
  lang: WatchProbeRequestLang;
  origin: string;
  probeCfg: WatchProbeConfig;
  isCancelled: () => boolean;
}): Promise<AnimexSourcesPickResult | null> {
  const {
    server,
    subType,
    seriesId,
    episodeId,
    lang,
    origin,
    probeCfg,
    isCancelled,
  } = params;

  if (isCancelled()) return null;

  let payload: Awaited<ReturnType<typeof getAnimexSourcesCached>>;
  try {
    payload = await getAnimexSourcesCached(seriesId, episodeId, server, subType);
  } catch {
    return null;
  }

  if (isCancelled() || !sourcesPayloadHasStream(payload)) return null;

  const candidates = buildAnimexStreamCandidates(payload, lang, server);
  if (!candidates.length) return null;

  for (const candidate of candidates) {
    if (isCancelled()) return null;
    const ok = await candidatePassesProbe(origin, candidate, probeCfg);
    if (ok) {
      return { server, subType, payload, candidates, verifiedCandidate: candidate };
    }
  }

  return null;
}

async function pickOnServer(params: {
  server: string;
  seriesId: string;
  episodeId: string;
  lang: WatchProbeRequestLang;
  origin: string;
  probeCfg: WatchProbeConfig;
  isCancelled: () => boolean;
}): Promise<AnimexSourcesPickResult | null> {
  const subTypes = watchLangToAnimexSubTypes(params.lang);
  for (const subType of subTypes) {
    const picked = await pickOnServerSubType({ ...params, subType });
    if (picked) return picked;
  }
  return null;
}

function firstSuccessful<T>(tasks: Array<() => Promise<T | null>>): Promise<T | null> {
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
  row: CrysolineAnimexEpisodeRow | null,
  lang: WatchProbeRequestLang,
  episodeHasDub?: boolean | null
): boolean {
  if (lang !== 'dub') return false;
  if (episodeHasDub === true) return false;
  const list = row?.metadata?.dubProviders;
  return !Array.isArray(list) || list.length === 0;
}

export async function pickAnimexSourcesWithProbe(params: {
  seriesId: string;
  episodeId: string;
  episodeRow: CrysolineAnimexEpisodeRow | null;
  lang: WatchProbeRequestLang;
  origin: string;
  probeCfg: WatchProbeConfig;
  preferredServerHint?: string | null;
  episodeHasDub?: boolean | null;
}): Promise<AnimexSourcesPickResult | null> {
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
    hintRaw && isValidAnimexPlaybackServerHint(hintRaw)
      ? normalizeAnimexPlaybackServerId(hintRaw)
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
