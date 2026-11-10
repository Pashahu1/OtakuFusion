/**
 * AniList catalog titles are English / romaji / native only — not uk or de.
 * Keep the Latin catalog title as the readable primary name in every UI locale.
 */
export function displayCatalogTitle(input: {
  title?: string | null;
  japanese_title?: string | null;
}): string {
  const latin = input.title?.trim();
  if (latin) return latin;
  return input.japanese_title?.trim() || '';
}
