import { getAnicoreEpisodesCached } from '@/server/anicore/episodesCached';
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
  const anicoreId = url.searchParams.get('anicore_id')?.trim();
  if (!anicoreId) {
    return Response.json(
      { error: 'anicore_id is required' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const { episodes, totalEpisodes } = await getAnicoreEpisodesCached(anicoreId);
    return Response.json(
      { episodes, totalEpisodes },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : 'anicore_episodes_failed' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
