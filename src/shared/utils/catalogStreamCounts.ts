import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export function aggregateCatalogStreamCounts(episodes: EpisodesTypes[]): {
  has_sub: number;
  has_dub: number;
} {
  let has_sub = 0;
  let has_dub = 0;
  for (const ep of episodes) {
    if (ep.hasSub !== false) has_sub++;
    if (ep.hasDub === true) has_dub++;
  }
  return { has_sub, has_dub };
}

export function aggregateTvInfoStreamCounts(
  episodes: EpisodesTypes[],
  opts: {
    provider: 'anicore' | 'aniliberty' | 'hikka';
    seriesDubHint?: boolean;
  }
): { has_sub: number; has_dub: number } {
  const counts = aggregateCatalogStreamCounts(episodes);
  if (opts.provider === 'hikka') {
    return { has_sub: counts.has_sub, has_dub: 0 };
  }
  if (opts.provider === 'aniliberty') {
    return { has_sub: counts.has_sub, has_dub: 0 };
  }
  if (opts.seriesDubHint && counts.has_dub === 0) {
    return { has_sub: counts.has_sub, has_dub: 1 };
  }
  return counts;
}
