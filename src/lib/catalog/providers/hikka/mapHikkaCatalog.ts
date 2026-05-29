import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { encodeHikkaEpToken } from '@/lib/catalog/providers/hikka/hikkaEpToken';
import type {
  HikkaWatchSource,
  HikkaWatchTeamIframeSource,
  HikkaWatchV2Response,
} from '@/lib/catalog/providers/hikka/hikkaTypes';

const SOURCE_ORDER: HikkaWatchSource[] = ['ashdi', 'tortuga', 'moon'];

const TEAM_PRIORITY = [
  'Glass Moon (GM)',
  'FanVoxUA',
  'Amanogawa',
  '4UA',
  'Inari',
  'Futashine',
];

function isSubtitleTeamName(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes('субтитр') || n.includes('subtitle');
}

function pickSource(watch: HikkaWatchV2Response): HikkaWatchSource | null {
  for (const key of SOURCE_ORDER) {
    const block = watch[key];
    if (block?.teams && Object.keys(block.teams).length > 0) return key;
  }
  return null;
}

function pickTeam(
  source: HikkaWatchSource,
  block: HikkaWatchTeamIframeSource
): string | null {
  const teams = block.teams ?? {};
  const names = Object.keys(teams).filter((n) => !isSubtitleTeamName(n));
  if (!names.length) return null;

  let best: { name: string; count: number; priority: number } | null = null;
  for (const name of names) {
    const eps = teams[name]?.episodes ?? [];
    const count = eps.length;
    if (count <= 0) continue;
    const priority = TEAM_PRIORITY.indexOf(name);
    const priScore = priority >= 0 ? 100 - priority : 0;
    if (
      !best ||
      count > best.count ||
      (count === best.count && priScore > best.priority)
    ) {
      best = { name, count, priority: priScore };
    }
  }
  return best?.name ?? names[0] ?? null;
}

export interface HikkaCatalogPick {
  source: HikkaWatchSource;
  team: string;
  teamLogo: string | null;
  availableTeams: Array<{ source: HikkaWatchSource; team: string; episodeCount: number }>;
}

export function pickDefaultHikkaCatalog(watch: HikkaWatchV2Response): HikkaCatalogPick | null {
  const source = pickSource(watch);
  if (!source) return null;
  const block = watch[source];
  if (!block) return null;
  const team = pickTeam(source, block);
  if (!team) return null;

  const availableTeams: HikkaCatalogPick['availableTeams'] = [];
  for (const src of SOURCE_ORDER) {
    const srcBlock = watch[src];
    if (!srcBlock?.teams) continue;
    for (const [teamName, data] of Object.entries(srcBlock.teams)) {
      if (isSubtitleTeamName(teamName)) continue;
      const count = data?.episodes?.length ?? 0;
      if (count > 0) availableTeams.push({ source: src, team: teamName, episodeCount: count });
    }
  }

  const logo = block.teams[team]?.logo?.trim() ?? null;
  return { source, team, teamLogo: logo || null, availableTeams };
}

export function mapHikkaTeamEpisodes(
  watch: HikkaWatchV2Response,
  pick: HikkaCatalogPick,
  displayTitle: string
): EpisodesTypes[] {
  const block = watch[pick.source];
  const rows = block?.teams?.[pick.team]?.episodes ?? [];
  const sorted = [...rows].sort((a, b) => a.episode - b.episode);
  const out: EpisodesTypes[] = [];

  for (const row of sorted) {
    const epNo = Math.floor(Number(row.episode));
    const pageUrl = row.video_url?.trim() ?? '';
    if (!Number.isFinite(epNo) || epNo <= 0 || !pageUrl.startsWith('http')) continue;
    const epToken = encodeHikkaEpToken({
      source: pick.source,
      team: pick.team,
      pageUrl,
    });
    out.push({
      episode_no: epNo,
      id: String(epNo),
      data_id: epNo,
      jname: displayTitle,
      title: `Episode ${epNo}`,
      japanese_title: `Episode ${epNo}`,
      ep_token: epToken,
      hasSub: true,
      hasDub: false,
    });
  }
  return out;
}
