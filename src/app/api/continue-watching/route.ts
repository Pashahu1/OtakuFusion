import { NextResponse } from 'next/server';
import { isBlockedAnimeInfo } from '@/lib/anime-content-policy';
import {
  handleRouteError,
  parseWithSchema,
  readJsonBody,
  unauthorizedResponse,
} from '@/lib/http';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/models/User';
import {
  MAX_CONTINUE_WATCHING_ENTRIES,
  continueWatchingEntryKey,
  parseContinueWatchingEntries,
} from '@/features/watch/lib/continue-watching-list';
import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';
import { ContinueWatchingPutSchema } from '@/shared/schemas/api';

function sameTitle(
  a: ContinueWatchingEntry,
  b: ContinueWatchingEntry,
): boolean {
  return a.id === b.id || a.data_id === b.data_id;
}

function upsertEntry(
  list: ContinueWatchingEntry[],
  entry: ContinueWatchingEntry,
): ContinueWatchingEntry[] {
  const without = list.filter((item) => !sameTitle(item, entry));
  return [entry, ...without].slice(0, MAX_CONTINUE_WATCHING_ENTRIES);
}

export async function GET() {
  try {
    const sessionUser = await getUserFromRequest();
    if (!sessionUser) return unauthorizedResponse();

    const doc = await User.findById(sessionUser._id).select('continueWatching').lean();
    if (!doc) return unauthorizedResponse();

    const entries = parseContinueWatchingEntries(doc.continueWatching);
    return NextResponse.json({ entries });
  } catch (err) {
    return handleRouteError(err, 'GET /api/continue-watching');
  }
}

export async function PUT(req: Request) {
  try {
    const sessionUser = await getUserFromRequest();
    if (!sessionUser) return unauthorizedResponse();

    const json = await readJsonBody(req);
    if (!json.ok) return json.response;

    const parsed = parseWithSchema(ContinueWatchingPutSchema, json.data);
    if (!parsed.ok) return parsed.response;

    const doc = await User.findById(sessionUser._id);
    if (!doc) return unauthorizedResponse();

    const current = parseContinueWatchingEntries(doc.continueWatching);

    if ('entries' in parsed.data) {
      doc.continueWatching = parseContinueWatchingEntries(parsed.data.entries);
    } else {
      const entry = parsed.data.entry;
      if (isBlockedAnimeInfo({ genres: entry.genres })) {
        return NextResponse.json({ message: 'Title is not available.' }, { status: 400 });
      }
      const withStamp: ContinueWatchingEntry = {
        ...entry,
        updatedAt: entry.updatedAt ?? Date.now(),
      };
      doc.continueWatching = upsertEntry(current, withStamp);
    }

    await doc.save();
    return NextResponse.json({
      ok: true,
      entries: parseContinueWatchingEntries(doc.continueWatching),
    });
  } catch (err) {
    return handleRouteError(err, 'PUT /api/continue-watching');
  }
}

export async function DELETE(req: Request) {
  try {
    const sessionUser = await getUserFromRequest();
    if (!sessionUser) return unauthorizedResponse();

    const animeId = new URL(req.url).searchParams.get('animeId')?.trim() ?? '';
    if (!animeId) {
      return NextResponse.json({ message: 'Anime id is required.' }, { status: 400 });
    }

    const doc = await User.findById(sessionUser._id);
    if (!doc) return unauthorizedResponse();

    const current = parseContinueWatchingEntries(doc.continueWatching);
    doc.continueWatching = current.filter(
      (entry) => continueWatchingEntryKey(entry) !== animeId && entry.id !== animeId,
    );
    await doc.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err, 'DELETE /api/continue-watching');
  }
}
