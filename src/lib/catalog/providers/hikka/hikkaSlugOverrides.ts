/**
 * AniList id → Hikka slug for franchises where MAL/title search collapses seasons.
 * Prefer this over /integrations/mal when Hikka merged several AniList entries
 * onto one MAL id (e.g. Steel Ball Run stages).
 */
export const HIKKA_SLUG_OVERRIDES_BY_ANILIST_ID: Readonly<Record<number, string>> =
  {
    269: 'bleach-e87d16',
    116674: 'bleach-sennen-kessen-hen-72c9ca',
    159322: 'bleach-sennen-kessen-hen-ketsubetsu-tan-b006b8',
    169755: 'bleach-sennen-kessen-hen-soukoku-tan-1afb16',
    185874: 'bleach-sennen-kessen-hen-kashin-tan-3ce3e3',
    14719: 'jojo-no-kimyou-na-bouken-tv-a67ac7',
    20474: 'jojo-no-kimyou-na-bouken-part-3-stardust-crusaders-05f5b6',
    20799: 'jojo-no-kimyou-na-bouken-part-3-stardust-crusaders-2nd-season-d7f0f9',
    21450: 'jojo-no-kimyou-na-bouken-part-4-diamond-wa-kudakenai-6d5edb',
    102883: 'jojo-no-kimyou-na-bouken-part-5-ougon-no-kaze-4f8a77',
    131942: 'jojo-no-kimyou-na-bouken-part-6-stone-ocean-a2ab4c',
    190327: 'jojo-no-kimyou-na-bouken-part-7-steel-ball-run-aae44e',
    210482: 'jojo-no-kimyou-na-bouken-part-7-steel-ball-run-aae44e',
  };

export function lookupHikkaSlugOverride(anilistId?: number | null): string | null {
  if (anilistId == null || !Number.isFinite(anilistId) || anilistId <= 0) {
    return null;
  }
  return HIKKA_SLUG_OVERRIDES_BY_ANILIST_ID[Math.floor(anilistId)] ?? null;
}
