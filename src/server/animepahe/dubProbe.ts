import { getAnimePaheSourcesCached } from '@/server/animepahe/sourcesCached';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

function sourcesPayloadHasDub(payload: {
  sources?: Array<{ isDub?: boolean; quality?: string }>;
}): boolean {
  const list = Array.isArray(payload.sources) ? payload.sources : [];
  if (list.some((s) => s.isDub === true)) return true;
  return list.some((s) => {
    const q = (s.quality ?? '').toLowerCase();
    return q.includes('dub') || q.includes('english dub');
  });
}

function applySeriesDubHint(episodes: EpisodesTypes[], hasSeriesDub: boolean): EpisodesTypes[] {
  if (!hasSeriesDub || !episodes.length) return episodes;
  return episodes.map((ep) => {
    const hasSub = ep.hasSub !== false;
    const variant =
      hasSub && hasSeriesDub ? 'Sub | Dub' : hasSeriesDub ? 'Dub' : ep.variant ?? 'Sub';
    return { ...ep, hasDub: true, variant };
  });
}

/**
 * Один запит `sources` для першого епізоду: якщо є дуб у відповіді Crysoline — позначаємо весь список (серіал).
 * Помилки (429 тощо) ігноруємо — повертаємо `episodes` без змін.
 */
export async function enrichEpisodesWithSeriesDubIfNeeded(
  seriesId: string,
  episodes: EpisodesTypes[]
): Promise<EpisodesTypes[]> {
  if (!episodes.length) return episodes;
  const hash = episodes[0]?.ep_token?.trim();
  if (!hash) return episodes;
  try {
    const payload = await getAnimePaheSourcesCached(seriesId.trim(), hash);
    if (sourcesPayloadHasDub(payload)) {
      return applySeriesDubHint(episodes, true);
    }
  } catch {
    /* ignore */
  }
  return episodes;
}
