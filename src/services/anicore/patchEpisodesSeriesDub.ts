import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export function patchEpisodesSeriesDub(
  episodes: EpisodesTypes[],
  hasSeriesDub: boolean
): EpisodesTypes[] {
  if (!hasSeriesDub || !episodes.length) return episodes;
  return episodes.map((ep) => {
    const hasSub = ep.hasSub !== false;
    const variant = hasSub ? 'Sub | Dub' : 'Dub';
    return { ...ep, variant };
  });
}
