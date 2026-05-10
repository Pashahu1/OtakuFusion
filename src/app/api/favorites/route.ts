import { NextResponse } from 'next/server';
import { getAniListMediaById, mapAniListMediaToAnimeInfo } from '@/lib/anilist';
import {
  handleRouteError,
  parseWithSchema,
  readJsonBody,
  unauthorizedResponse,
} from '@/lib/http';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/models/User';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { FavoriteAnimeBodySchema } from '@/shared/schemas/api';

export async function GET() {
  try {
    const sessionUser = await getUserFromRequest();
    if (!sessionUser) return unauthorizedResponse();

    const doc = await User.findById(sessionUser._id);
    if (!doc) return unauthorizedResponse();

    const ids = doc.favoriteAnimeIds ?? [];
    const settled = await Promise.allSettled(
      ids.map(async (id: string) => {
        const media = await getAniListMediaById(String(id));
        return mapAniListMediaToAnimeInfo(media);
      }),
    );

    const favorites: AnimeInfo[] = [];
    for (const item of settled) {
      if (item.status === 'fulfilled') favorites.push(item.value);
    }

    return NextResponse.json({ favorites });
  } catch (err) {
    return handleRouteError(err, 'GET /api/favorites');
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getUserFromRequest();
    if (!sessionUser) return unauthorizedResponse();

    const json = await readJsonBody(req);
    if (!json.ok) return json.response;

    const parsed = parseWithSchema(FavoriteAnimeBodySchema, json.data);
    if (!parsed.ok) return parsed.response;

    const { animeId } = parsed.data;
    const numericId = Number(animeId);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return NextResponse.json({ message: 'Invalid anime id.' }, { status: 400 });
    }

    const doc = await User.findById(sessionUser._id);
    if (!doc) return unauthorizedResponse();

    const current = [...(doc.favoriteAnimeIds ?? [])];
    const without = current.filter((id) => id !== animeId);
    doc.favoriteAnimeIds = [animeId, ...without];
    await doc.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err, 'POST /api/favorites');
  }
}

export async function DELETE(req: Request) {
  try {
    const sessionUser = await getUserFromRequest();
    if (!sessionUser) return unauthorizedResponse();

    const animeId = new URL(req.url).searchParams.get('animeId');
    if (!animeId || animeId.trim() === '') {
      return NextResponse.json({ message: 'Missing animeId.' }, { status: 400 });
    }

    const doc = await User.findById(sessionUser._id);
    if (!doc) return unauthorizedResponse();

    doc.favoriteAnimeIds = (doc.favoriteAnimeIds ?? []).filter((id: string) => id !== animeId);
    await doc.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err, 'DELETE /api/favorites');
  }
}
