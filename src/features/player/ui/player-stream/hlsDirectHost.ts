/** HLS hosts safer to fetch directly from the client (not via /api/m3u8-proxy). */
const HLS_DIRECT_HOST_SUFFIXES_BUILTIN = [] as const;

function readHlsDirectHostSuffixes(): string[] {
  const raw =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_HLS_DIRECT_HOST_SUFFIXES?.trim()
      : '';
  const fromEnv = raw
    ? raw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of [...HLS_DIRECT_HOST_SUFFIXES_BUILTIN, ...fromEnv]) {
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function hostMatchesHlsDirectSuffix(hostname: string, suffixes: string[]): boolean {
  for (const suf of suffixes) {
    if (!suf) continue;
    if (hostname === suf) return true;
    if (suf.startsWith('.') && hostname.endsWith(suf)) return true;
    if (hostname.endsWith(`.${suf}`)) return true;
  }
  return false;
}

/** Direct browser fetch (CORS allowed) — main playlist, subtitles, preview. */
export function isHlsDirectHostUrl(streamUrl: string): boolean {
  const raw = streamUrl.trim();
  if (!raw || !/^https?:\/\//i.test(raw)) return false;
  const suffixes = readHlsDirectHostSuffixes();
  if (!suffixes.length) return false;
  try {
    const host = new URL(raw).hostname.toLowerCase();
    return hostMatchesHlsDirectSuffix(host, suffixes);
  } catch {
    return false;
  }
}
