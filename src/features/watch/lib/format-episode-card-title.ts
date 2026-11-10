function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeLabel(value: string): string {
  return value
    .trim()
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/** Drops series name / "Episode 12" so the card can lead with E12. */
export function cleanEpisodeTitle(
  seriesTitle: string,
  episodeNo: number,
  rawTitle?: string | null,
): string {
  let title = rawTitle?.trim() ?? '';
  if (!title) return '';

  const series = seriesTitle.trim();
  if (series) {
    const seriesPattern = escapeRegExp(series);
    title = title.replace(new RegExp(`^${seriesPattern}\\s*[-–—:]\\s*`, 'i'), '');
    title = title.replace(new RegExp(`^${seriesPattern}\\s+`, 'i'), '');
    if (normalizeLabel(title) === normalizeLabel(series)) return '';
  }

  title = title
    .replace(
      new RegExp(`(?:^|[-–—:,])\\s*(?:episode|ep\\.?|e)\\s*0*${episodeNo}\\s*$`, 'i'),
      '',
    )
    .replace(/^[-–—:,]\s*/, '')
    .trim();

  if (!title) return '';
  if (new RegExp(`^(?:episode|ep\\.?|e)\\s*0*${episodeNo}$`, 'i').test(title)) {
    return '';
  }
  if (/^season\s*\d+$/i.test(title)) return '';

  return title;
}

export function formatEpisodeCardTitle(
  seriesTitle: string,
  episodeNo: number,
  rawTitle?: string | null,
): string {
  const epLabel = `E${episodeNo}`;
  const cleaned = cleanEpisodeTitle(seriesTitle, episodeNo, rawTitle);
  return cleaned ? `${epLabel} — ${cleaned}` : epLabel;
}
