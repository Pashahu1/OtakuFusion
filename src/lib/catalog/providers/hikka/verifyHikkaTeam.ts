import { extractM3u8FromEmbedPage } from '@/lib/catalog/providers/hikka/extractPageM3u8';
import { hikkaSourceContradictsCatalog } from '@/lib/catalog/providers/hikka/hikkaCatalogIdentity';
import {
  pickDefaultHikkaCatalog,
  type HikkaCatalogPick,
} from '@/lib/catalog/providers/hikka/mapHikkaCatalog';
import type {
  HikkaWatchSource,
  HikkaWatchV2Response,
} from '@/lib/catalog/providers/hikka/hikkaTypes';

export interface HikkaTeamResolution {
  pick: HikkaCatalogPick;
  ukrainianPlayable: boolean;
}

function pickFromTeam(
  watch: HikkaWatchV2Response,
  source: HikkaWatchSource,
  team: string,
  availableTeams: HikkaCatalogPick['availableTeams'],
): HikkaCatalogPick | null {
  const block = watch[source];
  const rows = block?.teams?.[team]?.episodes ?? [];
  if (!rows.length) return null;
  const logo = block?.teams?.[team]?.logo?.trim() || null;
  return { source, team, teamLogo: logo, availableTeams };
}

function firstPageUrl(
  watch: HikkaWatchV2Response,
  source: HikkaWatchSource,
  team: string,
): string {
  return watch[source]?.teams?.[team]?.episodes?.[0]?.video_url?.trim() ?? '';
}

/**
 * Prefer a dub team whose player file matches the open season.
 * A team that links another franchise (for example Stone Ocean files on a
 * Steel Ball Run page) is not playable.
 */
export async function resolveHikkaTeamForTitles(
  watch: HikkaWatchV2Response,
  titleTerms: string[],
): Promise<HikkaTeamResolution | null> {
  const fallback = pickDefaultHikkaCatalog(watch);
  if (!fallback) return null;
  if (!titleTerms.length) return { pick: fallback, ukrainianPlayable: true };

  const ordered = [
    { source: fallback.source, team: fallback.team },
    ...fallback.availableTeams.filter(
      (team) => team.source !== fallback.source || team.team !== fallback.team,
    ),
  ];

  let unverified: HikkaCatalogPick | null = null;
  let sawContradiction = false;

  for (const candidate of ordered) {
    const pick = pickFromTeam(
      watch,
      candidate.source,
      candidate.team,
      fallback.availableTeams,
    );
    if (!pick) continue;
    const pageUrl = firstPageUrl(watch, candidate.source, candidate.team);
    if (!pageUrl.startsWith('http')) continue;

    const mediaUrl = await extractM3u8FromEmbedPage(pageUrl);
    if (!mediaUrl) {
      unverified ??= pick;
      continue;
    }
    if (hikkaSourceContradictsCatalog(mediaUrl, titleTerms)) {
      sawContradiction = true;
      continue;
    }
    return { pick, ukrainianPlayable: true };
  }

  if (unverified && !sawContradiction) {
    return { pick: unverified, ukrainianPlayable: true };
  }
  if (sawContradiction) {
    return { pick: fallback, ukrainianPlayable: false };
  }
  return { pick: fallback, ukrainianPlayable: true };
}
