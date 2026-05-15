import { getAnilibertyEpisodesCached } from '@/server/aniliberty/episodesCached';
import { getCrysolineApiKey } from '@/server/crysoline/config';
import { mapCrysolineAnilibertyEpisodes } from '@/services/aniliberty/mapAnilibertyEpisodes';

export async function GET(req: Request) {
  try {
    getCrysolineApiKey();
  } catch {
    return Response.json(
      { error: 'crysoline_api_key_missing' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const url = new URL(req.url);
  const releaseId = url.searchParams.get('release_id')?.trim();
  if (!releaseId) {
    return Response.json(
      { error: 'release_id is required' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const rows = await getAnilibertyEpisodesCached(releaseId);
    const { episodes, totalEpisodes } = mapCrysolineAnilibertyEpisodes(rows);
    return Response.json(
      { episodes, totalEpisodes },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : 'aniliberty_episodes_failed' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
