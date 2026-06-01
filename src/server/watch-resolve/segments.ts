import type { CrysolineAnilibertyEpisodeRow } from '@/server/crysoline/anilibertyClient';

export function normalizeSkipSegmentBlock(
  block: { start?: number | null; end?: number | null } | null | undefined
): { start: number; end: number } | null {
  if (!block) return null;
  const s = block.start;
  const e = block.end;
  if (typeof s !== 'number' || typeof e !== 'number' || !Number.isFinite(s) || !Number.isFinite(e)) {
    return null;
  }
  return { start: s, end: e };
}

export function normalizeSkipFromEpisodeTiming(
  block: { start?: number | null; stop?: number | null } | null | undefined
): { start: number; end: number } | null {
  if (!block) return null;
  const s = block.start;
  const e = block.stop;
  if (
    typeof s !== 'number' ||
    typeof e !== 'number' ||
    !Number.isFinite(s) ||
    !Number.isFinite(e)
  ) {
    return null;
  }
  return { start: s, end: e };
}

export function findAnilibertyEpisodeRow(
  rows: CrysolineAnilibertyEpisodeRow[],
  episode: number,
  epToken: string
): CrysolineAnilibertyEpisodeRow | undefined {
  const token = epToken.trim();
  if (token) {
    const byId = rows.find((r) => r.id?.trim() === token);
    if (byId) return byId;
  }
  return rows.find(
    (r) => Number.isFinite(r.number) && Math.floor(r.number) === episode
  );
}
