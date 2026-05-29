/**
 * ╨¥╨░ animepahe / kwik ╨┤╤â╨▒ ╤â Crysoline ╤ç╨░╤ü╤é╨╛ ╨╗╨╕╤ê╨╡ ╨▓ ╤é╨╡╨║╤ü╤é╤û ╤Å╨║╨╛╤Ç╤Å, ╨╜╨░╨┐╤Ç╨╕╨║╨╗╨░╨┤:
 * `"quality": "Amazon ┬╖ 1080p Eng"` ╨┐╤Ç╨╕ `"isDub": false` (╨┤╨╕╨▓. ╨▓╤û╨┤╨┐╨╛╨▓╤û╨┤╤î sources).
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
  // ┬½ΓÇª1080p eng┬╗, ┬½ΓÇª299mb) eng┬╗ ΓÇö ╤ü╨╗╨╛╨▓╨╛ eng (╨╜╨╡ ╨╗╨╕╤ê╨╡ ╨┐╤û╨┤╤Ç╤Å╨┤╨╛╨║ ╨╜╨░ ╨║╤ê╤é╨░╨╗╤é "orange")
  if (/\beng\b/.test(q)) return true;
  return false;
}
