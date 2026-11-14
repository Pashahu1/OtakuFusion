import { z } from 'zod';

import { mapAnikotoStreamPayload } from '@/lib/catalog/providers/anikoto/mapAnikotoStream';
import type {
  AnikotoMappedStream,
  AnikotoSearchHit,
} from '@/lib/catalog/providers/anikoto/anikotoTypes';

import { getAnikotoApiBaseUrl, type AnikotoStreamServer } from './config';

const searchHitSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  type: z.string().optional(),
  sub: z.union([z.string(), z.number(), z.null()]).optional(),
  dub: z.union([z.string(), z.number(), z.null()]).optional(),
  episodes: z.union([z.string(), z.number(), z.null()]).optional(),
});

const searchSchema = z.object({
  data: z.array(searchHitSchema).optional(),
});

async function anikotoGet(path: string): Promise<unknown> {
  const response = await fetch(`${getAnikotoApiBaseUrl()}${path}`, {
    headers: { accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    throw new Error(`anikoto_http_${response.status}`);
  }
  return response.json();
}

export async function searchAnikoto(keyword: string): Promise<AnikotoSearchHit[]> {
  const query = keyword.trim();
  if (query.length < 2) return [];
  const payload = await anikotoGet(`/api/search?keyword=${encodeURIComponent(query)}`);
  const parsed = searchSchema.safeParse(payload);
  if (!parsed.success) return [];
  return parsed.data.data ?? [];
}

export async function fetchAnikotoStream(input: {
  id: string;
  episode: number;
  server: AnikotoStreamServer;
  type: 'sub' | 'dub';
}): Promise<AnikotoMappedStream | null> {
  const params = new URLSearchParams({
    id: input.id,
    ep: String(input.episode),
    server: input.server,
    type: input.type,
  });
  const payload = await anikotoGet(`/api/stream?${params.toString()}`);
  return mapAnikotoStreamPayload(payload);
}
