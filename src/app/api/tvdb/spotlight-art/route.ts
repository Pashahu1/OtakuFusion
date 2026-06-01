import { NextResponse } from 'next/server';
import { fetchTvdbSpotlightArtwork } from '@/server/tvdb/fetchClearLogoUrl';
import { resolveSpotlightSeasonLabel } from '@/shared/utils/resolveAnimeSeasonLabel';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title')?.trim();
  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const malIdRaw = searchParams.get('malId')?.trim();
  const malId =
    malIdRaw && /^\d+$/.test(malIdRaw) ? Number(malIdRaw) : undefined;
  const description = searchParams.get('description')?.trim() || undefined;

  const artwork = await fetchTvdbSpotlightArtwork({
    title,
    malId,
    description,
  });

  const seasonLabel = resolveSpotlightSeasonLabel({
    title,
    description,
    tvdbMatchedSeason: artwork.matchedSeasonSpecific,
  });

  return NextResponse.json({
    clearLogoUrl: artwork.clearLogoUrl,
    heroImageUrl: artwork.heroImageUrl,
    seasonLabel: seasonLabel ?? null,
  });
}
