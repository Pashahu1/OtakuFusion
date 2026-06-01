/** URL segment ↔ AniList genre label (e.g. `Sci-Fi`, `Mahou Shoujo`). */
export function genreFromSlug(slug: string): string {
  return decodeURIComponent(slug).trim();
}

export function genreToSlug(genre: string): string {
  return encodeURIComponent(genre);
}

export function genreBrowsePath(genre: string, sectionId: string): string {
  return `/anime/category/${genreToSlug(genre)}/browse/${sectionId}`;
}
