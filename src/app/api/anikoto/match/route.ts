import { z } from 'zod';

import { matchAnikotoCatalogCached } from '@/server/anikoto/matchCatalog';

const matchQuerySchema = z.object({
  title: z.string().trim().min(1).max(300),
  romaji_title: z.string().trim().max(300).optional(),
  japanese_title: z.string().trim().max(300).optional(),
  synonyms: z.string().trim().max(800).optional(),
  episodes: z.coerce.number().int().positive().max(5000).optional(),
  format: z.string().trim().max(40).optional(),
});

function readOptional(url: URL, key: string): string | undefined {
  const value = url.searchParams.get(key)?.trim();
  return value ? value : undefined;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = matchQuerySchema.safeParse({
    title: url.searchParams.get('title') ?? '',
    romaji_title: readOptional(url, 'romaji_title'),
    japanese_title: readOptional(url, 'japanese_title'),
    synonyms: readOptional(url, 'synonyms'),
    episodes: readOptional(url, 'episodes'),
    format: readOptional(url, 'format'),
  });

  if (!parsed.success) {
    return Response.json(
      { success: false, error: 'invalid_query' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const match = await matchAnikotoCatalogCached({
      title: parsed.data.title,
      romaji_title: parsed.data.romaji_title,
      japanese_title: parsed.data.japanese_title,
      synonyms: parsed.data.synonyms,
      episodeCount: parsed.data.episodes ?? null,
      format: parsed.data.format ?? null,
    });
    if (!match) {
      return Response.json(
        { success: false, error: 'anikoto_catalog_not_found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    return Response.json(
      { success: true, ...match },
      { headers: { 'Cache-Control': 'private, max-age=120' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'anikoto_match_failed';
    return Response.json(
      { success: false, error: message },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
