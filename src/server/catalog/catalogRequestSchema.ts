import { z } from 'zod';
import type { CatalogHints } from '@/lib/catalog/catalog-hints';
import { isAnilistStillAiringFromStatus } from '@/lib/catalog/providers/aniliberty/anilibertyEpisodeMatch';

/** Спільне тіло POST catalog routes (AniList / MAL metadata для match). */
export const CatalogRequestBodySchema = z.object({
  anilistId: z.string().min(1),
  title: z.string().min(1),
  romaji_title: z.string().optional(),
  japanese_title: z.string().optional(),
  showType: z.string().optional(),
  premiered: z.string().optional(),
  episodeTotal: z.string().optional(),
  mal_id: z.number().nullable().optional(),
  synonyms: z.string().optional(),
});

/** Aniliberty: додатково статус AniList для ongoing / partial catalog. */
export const CatalogRequestBodyWithAnilistStatusSchema =
  CatalogRequestBodySchema.extend({
    anilistStatus: z.string().optional(),
  });

export type CatalogRequestBody = z.infer<typeof CatalogRequestBodySchema>;
export type CatalogRequestBodyWithAnilistStatus = z.infer<
  typeof CatalogRequestBodyWithAnilistStatusSchema
>;

export function catalogHintsFromBody(
  b: CatalogRequestBody & { anilistStatus?: string }
): CatalogHints {
  const prem = b.premiered?.trim();
  let seasonYear: number | null = null;
  if (prem && /^\d{4}$/.test(prem)) {
    seasonYear = parseInt(prem, 10);
  }
  const et = b.episodeTotal?.trim();
  let episodeCount: number | null = null;
  if (et && /^\d+$/.test(et)) {
    episodeCount = parseInt(et, 10);
  }
  let anilistId: number | null = null;
  if (/^\d+$/.test(b.anilistId.trim())) {
    anilistId = parseInt(b.anilistId.trim(), 10);
  }
  const malId =
    typeof b.mal_id === 'number' && Number.isFinite(b.mal_id) && b.mal_id > 0
      ? Math.floor(b.mal_id)
      : null;
  return {
    format: b.showType?.trim() || null,
    seasonYear,
    episodeCount,
    anilistId,
    malId,
    isStillAiring: isAnilistStillAiringFromStatus(b.anilistStatus),
  };
}
