/**
 * На animepahe / kwik дуб у Crysoline часто лише в тексті якоря, наприклад:
 * `"quality": "Amazon · 1080p Eng"` при `"isDub": false` (див. відповідь sources).
 */
export function inferAnimepaheSourceIsDub(row: {
  isDub?: boolean;
  quality?: string | null;
}): boolean {
  if (row.isDub === true) return true;
  const q = (row.quality ?? '').trim().toLowerCase();
  if (!q) return false;
  if (
    q.includes('english dub') ||
    q.includes('(dub)') ||
    q.includes('[dub]') ||
    /\bdub\b/.test(q)
  ) {
    return true;
  }
  if (q.includes('[eng]') || q.includes('(eng)')) return true;
  // «…1080p eng», «…299mb) eng» — слово eng (не лише підрядок на кшталт "orange")
  if (/\beng\b/.test(q)) return true;
  return false;
}