/** Normalizes AniList duration strings for episode card badges (e.g. "24m"). */
export function formatEpisodeDuration(raw: string | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  if (/min/i.test(t)) return t.replace(/\s*per\s*ep.*$/i, '').trim();
  const m = t.match(/^(\d+)\s*m/i);
  if (m) return `${m[1]}m`;
  return t;
}
