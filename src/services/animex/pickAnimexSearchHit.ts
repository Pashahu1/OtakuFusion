import type { CrysolineAnimexSearchRow } from '@/server/crysoline/animexClient';
import type { AnimepaheCatalogHints } from '@/services/catalog/catalogHints';

export function pickAnimexSearchHit(
  hits: CrysolineAnimexSearchRow[],
  hints: AnimepaheCatalogHints
): CrysolineAnimexSearchRow | null {
  if (!hits.length) return null;

  if (hints.anilistId != null) {
    const byAl = hits.find(
      (h) => h.idAl === hints.anilistId || h.id === hints.anilistId
    );
    if (byAl) return byAl;
  }

  if (hints.malId != null) {
    const byMal = hits.find((h) => h.idMal === hints.malId);
    if (byMal) return byMal;
  }

  return hits[0] ?? null;
}
