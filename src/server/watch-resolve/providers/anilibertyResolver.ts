import { getAnilibertyEpisodesCached } from '@/server/aniliberty/episodesCached';
import { getAnilibertySourcesCached } from '@/server/aniliberty/sourcesCached';
import type { CrysolineAnilibertySourcesPayload } from '@/server/crysoline/anilibertyClient';
import {
  buildAnilibertyStreamCandidatesFromEpisodeRow,
  buildAnilibertyStreamCandidatesFromSources,
} from '@/lib/catalog/providers/aniliberty/buildAnilibertyStreamCandidates';
import { mapCrysolineAnilibertyEpisodes } from '@/lib/catalog/providers/aniliberty/mapAnilibertyEpisodes';
import { isAnilibertyEpisodeCountAcceptable } from '@/lib/catalog/providers/aniliberty/anilibertyEpisodeMatch';
import {
  prioritizeByServerHint,
  qualityVariantsFromCandidates,
} from '@/server/watch-resolve/candidates';
import { pickEpisodeByNumber } from '@/server/watch-resolve/episodes';
import { watchResolveErrorOutcome } from '@/server/watch-resolve/outcome';
import {
  buildProbeHeaders,
  readWatchProbeConfig,
  resolveFirstWorkingStreamCandidate,
} from '@/server/watch-resolve/probe';
import {
  findAnilibertyEpisodeRow,
  normalizeSkipFromEpisodeTiming,
  normalizeSkipSegmentBlock,
} from '@/server/watch-resolve/segments';
import type { AnilibertyResolveParams, WatchResolveOutcome } from '@/server/watch-resolve/types';

export async function computeAnilibertyWatchResolveOutcome(
  params: AnilibertyResolveParams
): Promise<WatchResolveOutcome> {
  const {
    startedAt,
    episode,
    origin,
    seriesId,
    preferredHint,
    epTokenOverride,
    expectedEpisodes,
    anilistStillAiring = false,
  } = params;
  const probeCfg = readWatchProbeConfig('sub');

  try {
    const rows = await getAnilibertyEpisodesCached(seriesId);
    const { episodes, totalEpisodes } = mapCrysolineAnilibertyEpisodes(rows);

    if (
      expectedEpisodes != null &&
      !isAnilibertyEpisodeCountAcceptable(expectedEpisodes, totalEpisodes, {
        allowPartialCatalog: anilistStillAiring,
        isOngoing: anilistStillAiring,
      })
    ) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'aniliberty_episode_count_mismatch',
          reason: `Anilibria has ${totalEpisodes} episodes, expected about ${expectedEpisodes}`,
        },
      };
    }

    const targetEpisode = pickEpisodeByNumber(episodes, episode);

    let epToken = epTokenOverride?.trim() ?? '';
    if (epToken && targetEpisode?.ep_token?.trim() && epToken !== targetEpisode.ep_token.trim()) {
      epToken = targetEpisode.ep_token.trim();
    }
    if (!epToken) {
      epToken = targetEpisode?.ep_token?.trim() ?? '';
    }
    if (!epToken) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'episode_not_found',
          reason: `Episode ${episode} is missing in Aniliberty catalog`,
        },
      };
    }

    const rawRow = findAnilibertyEpisodeRow(rows, episode, epToken);
    let candidates = buildAnilibertyStreamCandidatesFromEpisodeRow(rawRow);
    let sourcesPayload: CrysolineAnilibertySourcesPayload | null = null;

    if (!candidates.length) {
      sourcesPayload = await getAnilibertySourcesCached(seriesId, epToken);
      candidates = buildAnilibertyStreamCandidatesFromSources(sourcesPayload);
    }

    if (!candidates.length) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'no_working_source',
          reason: 'aniliberty_sources_empty',
        },
      };
    }

    candidates = prioritizeByServerHint(candidates, preferredHint);

    const primary = await resolveFirstWorkingStreamCandidate(
      candidates,
      origin,
      probeCfg,
      'sub'
    );

    let intro = normalizeSkipSegmentBlock(sourcesPayload?.intro);
    let outro = normalizeSkipSegmentBlock(sourcesPayload?.outro);
    if (!intro && !outro && rawRow?.metadata) {
      intro = normalizeSkipFromEpisodeTiming(rawRow.metadata.opening);
      outro = normalizeSkipFromEpisodeTiming(rawRow.metadata.ending);
    }

    const body: Record<string, unknown> = {
      success: true,
      stream_provider: 'aniliberty',
      resolved_anime: {
        ani_id: seriesId,
        slug: seriesId,
        status: 'verified',
        resolved_by: 'cache',
      },
      episode: {
        number: episode,
        ep_token: epToken,
        hasSub: true,
        hasDub: false,
      },
      stream: {
        url: primary.link.file,
        lang: 'sub',
        server: primary.server,
        request_headers: buildProbeHeaders(primary),
        tracks: primary.tracks ?? [],
      },
      segments: {
        intro,
        outro,
      },
      fallback: {
        applied: false,
        from: null,
        to: null,
        reason: null,
      },
      debug: {
        latency_ms: Date.now() - startedAt,
        requested_lang: 'sub',
      },
    };

    const qualityVariants = qualityVariantsFromCandidates(candidates);
    if (qualityVariants.length > 1) {
      body.quality_variants = qualityVariants;
    }

    return { status: 200, body };
  } catch (error) {
    return watchResolveErrorOutcome(error);
  }
}
