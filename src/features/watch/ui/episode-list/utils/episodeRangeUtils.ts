export function findRangeForEpisode(
  episodeNumber: number,
  totalEpisodes: number
) {
  const step = 100;
  const start = Math.floor((episodeNumber - 1) / step) * step + 1;
  const end = Math.min(start + step - 1, totalEpisodes);
  return [start, end];
}

export function generateRangeOptions(total: number) {
  const step = 100;
  const ranges: string[] = [];
  for (let i = 0; i < total; i += step) {
    const start = i + 1;
    const end = Math.min(i + step, total);
    ranges.push(`${start}-${end}`);
  }
  return ranges;
}
