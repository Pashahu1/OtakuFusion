import {
  inferStreamFormat,
  qualityVariantsFromCandidates,
} from '@/server/watch-resolve/candidates';
import { buildProbeHeaders } from '@/server/watch-resolve/probe';
import { attachAnilibriaSegmentHints } from '@/server/watch-resolve/segments';
import type { WatchLang } from '@/server/watch-resolve/types';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { StreamingType } from '@/shared/types/StreamingTypes';

export async function buildAnimepaheResolveSuccessBody(input: {
  startedAt: number;
  seriesId: string;
  episode: number;
  epHash: string;
  lang: WatchLang;
  targetEpisode: EpisodesTypes | null;
  primary: StreamingType;
  candidates: StreamingType[];
  anilibertyReleaseId?: string | null;
  fromMiruno: boolean;
  fallbackApplied: boolean;
  usedLang: WatchLang;
}): Promise<Record<string, unknown>> {
  const {
    startedAt,
    seriesId,
    episode,
    epHash,
    lang,
    targetEpisode,
    primary,
    candidates,
    anilibertyReleaseId,
    fromMiruno,
    fallbackApplied,
    usedLang,
  } = input;

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

  return body;
}
