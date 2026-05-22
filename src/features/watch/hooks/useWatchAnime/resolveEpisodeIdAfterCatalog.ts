import {
  episodeMatchesSelection,
  getEpisodeNumberFromId,
} from '@/shared/utils/episodeUtils';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

/**
 * Після зміни провайдера (Language) — лишити поточну серію, не скидати на `?ep=1` з URL.
 */
export function resolveEpisodeIdAfterCatalog(
  mergedEpisodes: EpisodesTypes[],
  preserveEpisodeNum: string | null,
  initialEpisodeFromUrl: string | undefined
): string | null {
  const preserve = preserveEpisodeNum?.trim() || null;

  if (preserve) {
    if (mergedEpisodes.some((ep) => episodeMatchesSelection(ep, preserve))) {
      return preserve;
    }
    const n = Number(preserve);
    if (Number.isFinite(n) && n > 0) {
      const byNo = mergedEpisodes.find((ep) => ep.episode_no === n);
      if (byNo) {
        return getEpisodeNumberFromId(byNo.id) ?? String(byNo.episode_no);
      }
    }
  }

  const fromUrl = initialEpisodeFromUrl?.trim();
  if (fromUrl && mergedEpisodes.some((ep) => episodeMatchesSelection(ep, fromUrl))) {
    return fromUrl;
  }

  if (!mergedEpisodes.length) return null;
  return (
    getEpisodeNumberFromId(mergedEpisodes[0].id) ?? String(mergedEpisodes[0].episode_no)
  );
}
