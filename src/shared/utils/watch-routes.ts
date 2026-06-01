/** Series metadata + episode picker (no player). */
export function watchSeriesPath(animeId: string): string {
  return `/watch/${encodeURIComponent(animeId)}`;
}

/** Full-screen player for an episode. */
export function watchPlayPath(animeId: string, episode: string | number): string {
  const ep = String(episode).trim();
  return `/watch/${encodeURIComponent(animeId)}/play?ep=${encodeURIComponent(ep)}`;
}
