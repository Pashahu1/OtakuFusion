import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

function stripLeadingEpisodeLabel(title: string): string {
  return title.replace(/^\s*Episode\s+[\d.]+\s*/i, '').trim();
}

function rowHaystack(ep: EpisodesTypes): string {
  return `${ep.title} ${ep.jname} ${ep.japanese_title ?? ''}`.toLowerCase();
}

function tokenOverlapScore(needle: string, haystack: string): number {
  const words = needle
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]+/gu, ''))
    .filter((w) => w.length > 3);
  if (!words.length) return 0;
  let n = 0;
  for (const w of words) {
    if (haystack.includes(w)) n += 1;
  }
  return n;
}

export function alignEpisodesToAnilistSeasonStart(
  episodes: EpisodesTypes[],
  anilistEpisodeTitles: Readonly<Record<string, string>> | undefined
): EpisodesTypes[] {
  if (!episodes.length || !anilistEpisodeTitles) return episodes;
  const rawAl1 = anilistEpisodeTitles['1']?.trim();
  if (!rawAl1) return episodes;

  const rest1 = stripLeadingEpisodeLabel(rawAl1);
  if (rest1.length < 6) return episodes;

  const sorted = [...episodes].sort((a, b) => a.episode_no - b.episode_no);
  if (sorted.length < 2) return episodes;

  const needle = rest1.toLowerCase();
  const h0 = rowHaystack(sorted[0]);
  const h1 = rowHaystack(sorted[1]);
  const s0 = tokenOverlapScore(needle, h0);
  const s1 = tokenOverlapScore(needle, h1);

  const secondMatchesFirstAnilist = s1 >= s0 + 2;
  const firstMissesSecondHits = s0 === 0 && s1 >= 2;

  let cut = 0;
  if (secondMatchesFirstAnilist || firstMissesSecondHits) {
    cut = 1;
  } else if (needle.length >= 10) {
    const idx = sorted.findIndex((e) => rowHaystack(e).includes(needle));
    if (idx > 0) cut = idx;
  }

  if (cut <= 0) return episodes;

  const sliced = sorted.slice(cut);
  return sliced.map((ep, idx) => ({
    ...ep,
    episode_no: idx + 1,
    data_id: idx + 1,
    id: `?ep=${idx + 1}`,
  }));
}
