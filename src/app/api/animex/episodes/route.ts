import { getAnimexEpisodesCached } from '@/server/animex/episodesCached';
import { getCrysolineApiKey } from '@/server/crysoline/config';

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
  const animexId = url.searchParams.get('animex_id')?.trim();
  if (!animexId) {
    return Response.json(
      { error: 'animex_id is required' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const { episodes, totalEpisodes } = await getAnimexEpisodesCached(animexId);
    return Response.json(
      { episodes, totalEpisodes },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : 'animex_episodes_failed' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
