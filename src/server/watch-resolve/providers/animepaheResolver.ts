import { getAnimePaheEpisodesCached } from '@/server/animepahe/episodesCached';
import { getAnimePaheSourcesCached } from '@/server/animepahe/sourcesCached';
import { buildAnimepaheStreamCandidates } from '@/lib/catalog/providers/animepahe/buildAnimepaheStreamCandidates';
import { tryResolveMirunoDubHls } from '@/server/miruno/fetchMirunoDubStream';
import {
  inferStreamFormat,
  prioritizeByServerHint,
  qualityVariantsFromCandidates,
} from '@/server/watch-resolve/candidates';
import { pickEpisodeByNumber } from '@/server/watch-resolve/episodes';
import { watchResolveErrorOutcome } from '@/server/watch-resolve/outcome';
import {
  buildProbeHeaders,
  resolveFirstWorkingStreamCandidate,
} from '@/server/watch-resolve/probe';
import { attachAnilibriaSegmentHints } from '@/server/watch-resolve/segments';
import type {
  AnimepaheResolveParams,
  WatchLang,
  WatchResolveOutcome,
} from '@/server/watch-resolve/types';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { StreamingType } from '@/shared/types/StreamingTypes';

export async function computeAnimepaheWatchResolveOutcome(
  params: AnimepaheResolveParams
): Promise<WatchResolveOutcome> {
  const {
    startedAt,
    episode,
    lang,
    probeCfg,
    origin,
    seriesId,
    preferredHint,
    anilibertyReleaseId,
    anilistId,
    epTokenOverride,
    episodeHasDub,
  } = params;

  try {
    let epHash = epTokenOverride?.trim() ?? '';
    let targetEpisode: EpisodesTypes | null = null;

    if (!epHash || episodeHasDub == null) {
      const episodesResult = await getAnimePaheEpisodesCached(seriesId);
      targetEpisode = pickEpisodeByNumber(episodesResult.episodes, episode);
      if (!epHash) epHash = targetEpisode?.ep_token?.trim() ?? '';
    } else {
      targetEpisode = {
        episode_no: episode,
        id: String(episode),
        data_id: episode,
        jname: '',
        title: '',
        japanese_title: '',
        ep_token: epHash,
        hasSub: true,
        hasDub: episodeHasDub === true,
      };
    }

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
          lang
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
    const usedLang: WatchLang = primary.type === 'dub' ? 'dub' : 'sub';
    const fallbackApplied = !fromMiruno && lang !== usedLang;

    const body: Record<string, unknown> = {
      success: true,
      stream_provider: 'animepahe',
      resolved_anime: {
        ani_id: seriesId,
        slug: seriesId,
        status: 'verified',
        resolved_by: 'cache',
      },
      episode: {
        number: episode,
        ep_token: epHash,
        hasSub: Boolean(targetEpisode?.hasSub ?? true),
        hasDub: fromMiruno ? false : Boolean(targetEpisode?.hasDub ?? false),
      },
      stream: {
        url: primary.link.file,
        format: inferStreamFormat(primary),
        lang: fromMiruno ? 'dub' : usedLang,
        server: primary.server,
        request_headers: buildProbeHeaders(primary),
        tracks: primary.tracks ?? [],
      },
      fallback: {
        applied: fallbackApplied,
        from: fallbackApplied ? lang : null,
        to: fallbackApplied ? usedLang : null,
        reason: fallbackApplied ? `${lang}_unavailable_or_failed` : null,
      },
      debug: {
        latency_ms: Date.now() - startedAt,
        requested_lang: lang,
        ...(fromMiruno ? { miruno_dub_gap_fill: true } : {}),
      },
    };

    const qualityVariants = qualityVariantsFromCandidates(candidates);
    if (qualityVariants.length > 1) {
      body.quality_variants = qualityVariants;
    }

    const libertyId = anilibertyReleaseId?.trim() ?? null;
    if (libertyId) {
      await attachAnilibriaSegmentHints(body, libertyId, episode);
    }

    return { status: 200, body };
  } catch (error) {
    return watchResolveErrorOutcome(error);
  }
}
