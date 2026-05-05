import { z } from 'zod';

function toTrimmedNonEmptyString(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .preprocess((v) => toTrimmedNonEmptyString(v), z.string().min(1))
    .transform((v) => v.replace(/\/+$/, '')),
  NEXT_PUBLIC_PROXY_URL: z
    .preprocess((v) => toTrimmedNonEmptyString(v), z.string().min(1).optional())
    .optional(),
  NEXT_PUBLIC_M3U8_PROXY_URL: z
    .preprocess(
      (v) => toTrimmedNonEmptyString(v),
      z.string().min(1).optional()
    )
    .optional(),
  NEXT_PUBLIC_STREAM_API_URL: z
    .preprocess(
      (v) => toTrimmedNonEmptyString(v),
      z.string().min(1).optional()
    )
    .transform((v) => v?.replace(/\/+$/, ''))
    .optional(),
  NEXT_PUBLIC_ANIMEKAI_API_URL: z
    .preprocess((v) => {
      const t = toTrimmedNonEmptyString(v);
      return t ?? 'https://animekai.fly.dev';
    }, z.string().min(1))
    .transform((v) => v.replace(/\/+$/, '')),
  /** Якщо true — спочатку GET /api/anime/anilist/{id}, потім /api/anime/mal/{mal_id} (бекенд AnimeKai). */
  NEXT_PUBLIC_ANIMEKAI_ANILIST_RESOLVE: z
    .preprocess((v) => v === 'true' || v === '1', z.boolean())
    .optional()
    .default(false),
});

export const publicEnv = PublicEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_PROXY_URL: process.env.NEXT_PUBLIC_PROXY_URL,
  NEXT_PUBLIC_M3U8_PROXY_URL: process.env.NEXT_PUBLIC_M3U8_PROXY_URL,
  NEXT_PUBLIC_STREAM_API_URL: process.env.NEXT_PUBLIC_STREAM_API_URL,
  NEXT_PUBLIC_ANIMEKAI_API_URL: process.env.NEXT_PUBLIC_ANIMEKAI_API_URL,
  NEXT_PUBLIC_ANIMEKAI_ANILIST_RESOLVE:
    process.env.NEXT_PUBLIC_ANIMEKAI_ANILIST_RESOLVE,
});

export type PublicEnv = typeof publicEnv;

