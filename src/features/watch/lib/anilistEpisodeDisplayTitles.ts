import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export function stripAnilistStreamingEpisodeLabel(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  const withoutPrefix = t
    .replace(/^\s*(?:Episode|Ep\.?)\s*#?\s*[\d.]+\s*[-–—:|]\s*/i, '')
    .replace(/^\s*Episode\s+[\d.]+\s+/i, '')
    .replace(/^\s*\d+\s*[.:\-|–—]\s+/i, '')
    .trim();
  return withoutPrefix.length >= 2 ? withoutPrefix : t;
}

export function applyAnilistEpisodeDisplayTitles(
  episodes: EpisodesTypes[],
  anilistEpisodeTitles: Readonly<Record<string, string>> | undefined,
  seriesTitleEn: string | undefined,
  seriesRomaji: string | undefined
): EpisodesTypes[] {
  const show = seriesTitleEn?.trim() || seriesRomaji?.trim() || '';
  return episodes.map((ep) => {
    const rawAl = anilistEpisodeTitles?.[String(ep.episode_no)]?.trim();
    if (rawAl) {
      const cleaned = stripAnilistStreamingEpisodeLabel(rawAl);
      return { ...ep, title: cleaned, jname: cleaned, japanese_title: cleaned };
    }
    const fb = show ? `${show} - Episode ${ep.episode_no}` : `Episode ${ep.episode_no}`;
    return { ...ep, title: fb, jname: fb, japanese_title: fb };
  });
}
