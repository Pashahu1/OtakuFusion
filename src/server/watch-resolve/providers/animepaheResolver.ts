import { getAnimePaheSourcesCached } from '@/server/animepahe/sourcesCached';
import { buildAnimepaheStreamCandidates } from '@/lib/catalog/providers/animepahe/buildAnimepaheStreamCandidates';
import { tryResolveMirunoDubHls } from '@/server/miruno/fetchMirunoDubStream';
import { prioritizeByServerHint } from '@/server/watch-resolve/candidates';
import { watchResolveErrorOutcome } from '@/server/watch-resolve/outcome';
import { resolveFirstWorkingStreamCandidate } from '@/server/watch-resolve/probe';
import type { AnimepaheResolveParams, WatchResolveOutcome } from '@/server/watch-resolve/types';
import type { StreamingType } from '@/shared/types/StreamingTypes';

import { buildAnimepaheResolveSuccessBody } from './animepahe/buildAnimepaheResolveBody';
import { loadAnimepaheEpisodeContext } from './animepahe/loadAnimepaheEpisode';

export async function computeAnimepaheWatchResolveOutcome(
  params: AnimepaheResolveParams,
): Promise<WatchResolveOutcome> {
  const {
    startedAt,
    episode,
    lang,
    probeCfg,
    origin,
    seriesId,
    preferredHint,
    anilistId,
    epTokenOverride,
    episodeHasDub,
  } = params;

  try {
    const { epHash, targetEpisode } = await loadAnimepaheEpisodeContext(
      seriesId,
      episode,
      epTokenOverride,
      episodeHasDub,
    );

    if (!epHash) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'episode_not_found',
          reason: `Episode ${episode} is missing in Animepahe catalog`,
        },
      };
    }

    const tryMirunoGapDub =
      lang === 'dub' &&
      targetEpisode != null &&
      targetEpisode.hasDub !== true &&
      anilistId != null;

    const sourcesPayload = await getAnimePaheSourcesCached(seriesId, epHash);
    let candidates = buildAnimepaheStreamCandidates(sourcesPayload, lang);
    candidates = prioritizeByServerHint(candidates, preferredHint);

    let primary: StreamingType | null = null;

    if (candidates.length > 0) {
      try {
        primary = await resolveFirstWorkingStreamCandidate(
          candidates,
          origin,
          probeCfg,
          lang,
        );
      } catch {
        primary = null;
      }
    }

    if (!primary && tryMirunoGapDub) {
      primary = await tryResolveMirunoDubHls({
        anilistId: anilistId as number,
        episode,
        origin,
        probeCfg,
      });
    }

    if (!primary) {
      if (!candidates.length) {
        return {
          status: 404,
          body: {
            success: false,
            error: 'no_working_source',
            reason: 'animepahe_sources_empty',
          },
        };
      }
      return {
        status: 404,
        body: {
          success: false,
          error: 'no_working_source',
          reason: `${lang}_not_available`,
        },
      };
    }

    const fromMiruno = primary.server?.toLowerCase().includes('miruno') ?? false;
    const usedLang = primary.type === 'dub' ? 'dub' : 'sub';
    const fallbackApplied = !fromMiruno && lang !== usedLang;

    const body = await buildAnimepaheResolveSuccessBody({
      startedAt,
      seriesId,
      episode,
      epHash,
      lang,
      targetEpisode,
      primary,
      candidates,
      fromMiruno,
      fallbackApplied,
      usedLang,
    });

    return { status: 200, body };
  } catch (error) {
    return watchResolveErrorOutcome(error);
  }
}
