import { getAnilibertyEpisodesCached } from '@/server/aniliberty/episodesCached';
import { getAnilibertySourcesCached } from '@/server/aniliberty/sourcesCached';
import type { CrysolineAnilibertyEpisodeRow } from '@/server/crysoline/anilibertyClient';
import { mapCrysolineAnilibertyEpisodes } from '@/lib/catalog/providers/aniliberty/mapAnilibertyEpisodes';
import { pickEpisodeByNumber } from '@/server/watch-resolve/episodes';

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

function shouldFetchAnilibriaSegmentHints(): boolean {
  const v = process.env.WATCH_RESOLVE_FETCH_SEGMENT_HINTS?.trim().toLowerCase();
  return v === '1' || v === 'true';
}

export async function attachAnilibriaSegmentHints(
  body: Record<string, unknown>,
  libertyId: string,
  episode: number
): Promise<void> {
  if (!shouldFetchAnilibriaSegmentHints()) return;
  try {
    const rows = await getAnilibertyEpisodesCached(libertyId);
    const { episodes: libertyEpisodes } = mapCrysolineAnilibertyEpisodes(rows);
    const libertyTarget = pickEpisodeByNumber(libertyEpisodes, episode);
    const libertyEpToken = libertyTarget?.ep_token?.trim();
    if (!libertyEpToken) return;
    const segPayload = await getAnilibertySourcesCached(libertyId, libertyEpToken);
    const intro = normalizeSkipSegmentBlock(segPayload.intro);
    const outro = normalizeSkipSegmentBlock(segPayload.outro);
    if (intro || outro) {
      body.segments = { intro, outro };
    }
  } catch {
    // optional enrichment
  }
}
