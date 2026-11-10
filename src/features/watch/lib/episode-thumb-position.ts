/** Distinct poster crop per episode so unwatched thumbs are not identical. */
export function episodeThumbObjectPosition(episodeNo: number): string {
  const n = Number.isFinite(episodeNo) ? Math.abs(Math.floor(episodeNo)) : 0;
  const x = 28 + ((n * 17) % 45);
  const y = 22 + ((n * 13) % 48);
  return `${x}% ${y}%`;
}
