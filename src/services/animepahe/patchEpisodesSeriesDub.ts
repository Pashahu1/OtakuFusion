import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

/** ╨Ü╨╗╤û╤ö╨╜╤é╤ü╤î╨║╨╕╨╣ ╨┐╨░╤é╤ç ╨┐╤û╤ü╨╗╤Å ╨║╨╡╤ê╤â `pahe_id` ΓÇö ╨▒╨╡╨╖ ╨┤╨╛╨┤╨░╤é╨║╨╛╨▓╨╛╨│╨╛ ╨▓╨╕╨║╨╗╨╕╨║╤â `sources`. */
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
