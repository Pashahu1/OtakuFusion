/** Parse `720p`, `1080p`, etc. from a quality/server label — 0 when unknown. */
export function streamQualityRank(label: string | undefined | null): number {
  const q = (label ?? '').toLowerCase();
  const m = q.match(/(\d{3,4})p/);
  return m ? parseInt(m[1], 10) : 0;
}
