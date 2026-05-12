const HEALTH_INDEX_KEY = 'animekai:health:v1';
const LEGACY_PREFIX = 'animekai:health:';
const MAX_INDEX_ENTRIES = 400;

export interface AnimeKaiHealthRow {
  hasDub: boolean;
  episodeCount: number;
}

function readIndex(): Record<string, AnimeKaiHealthRow> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(HEALTH_INDEX_KEY);
    if (!raw?.trim()) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Record<string, AnimeKaiHealthRow>;
  } catch {
    return {};
  }
}

function readLegacyRow(animeId: string): AnimeKaiHealthRow | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${LEGACY_PREFIX}${animeId}`);
    if (!raw) return null;
    return JSON.parse(raw) as AnimeKaiHealthRow;
  } catch {
    return null;
  }
}

export function readEpisodeHealth(animeId: string): AnimeKaiHealthRow | null {
  const row = readIndex()[animeId];
  if (row && typeof row.episodeCount === 'number' && typeof row.hasDub === 'boolean') {
    return row;
  }
  return readLegacyRow(animeId);
}

export function writeEpisodeHealth(animeId: string, data: AnimeKaiHealthRow): void {
  if (typeof window === 'undefined') return;
  try {
    const index = readIndex();
    index[animeId] = data;
    const entries = Object.entries(index);
    const pruned =
      entries.length > MAX_INDEX_ENTRIES
        ? Object.fromEntries(entries.slice(-MAX_INDEX_ENTRIES))
        : index;
    localStorage.setItem(HEALTH_INDEX_KEY, JSON.stringify(pruned));
    localStorage.removeItem(`${LEGACY_PREFIX}${animeId}`);
  } catch {
    /* ignore */
  }
}
