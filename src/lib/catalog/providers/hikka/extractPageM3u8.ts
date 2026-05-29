const M3U8_IN_PLAYERJS =
  /file\s*:\s*['"](https?:\/\/[^'"]+\.m3u8[^'"]*)['"]/i;

const M3U8_GENERIC = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i;

/** Variable name on moonanime rotates (`_3BHrk`, `_2J1eM`, …). */
const MOON_OBFUSCATED_ATOB = /var\s+_\w+\s*=\s*atob\(\s*"([^"]+)"\s*\)/;
const MOON_FILE_XOR = /file\s*:\s*_0xd\(\s*"([^"]+)"\s*\)/;

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
};

function isMoonanimeHost(pageUrl: string): boolean {
  try {
    return new URL(pageUrl).hostname.toLowerCase().includes('moonanime');
  } catch {
    return false;
  }
}

/** XOR as in `function _0xd(e)` on moonanime.art iframe. */
export function decodeMoonanimeXorBlob(b64: string): string {
  const key = 'mAnK';
  const raw = Buffer.from(b64, 'base64').toString('binary');
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    out += String.fromCharCode(raw.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  try {
    return decodeURIComponent(escape(out));
  } catch {
    return out;
  }
}

function decodeMoonanimeObfuscatedPlayerScript(html: string): string | null {
  const atobMatch = MOON_OBFUSCATED_ATOB.exec(html);
  if (!atobMatch?.[1]) return null;

  const bytes = Buffer.from(atobMatch[1], 'base64');
  if (bytes.length <= 32) return null;

  const key = bytes.subarray(0, 32);
  const payload = bytes.subarray(32);
  const decoded = new Uint8Array(payload.length);
  for (let i = 0; i < payload.length; i++) {
    decoded[i] = payload[i]! ^ key[i % 32]!;
  }

  return new TextDecoder().decode(decoded);
}

function extractMoonanimeM3u8FromHtml(html: string): string | null {
  const inner = decodeMoonanimeObfuscatedPlayerScript(html);
  if (!inner) return null;

  const fileMatch = MOON_FILE_XOR.exec(inner);
  if (!fileMatch?.[1]) return null;

  const url = decodeMoonanimeXorBlob(fileMatch[1]).trim();
  if (!url.startsWith('http') || !url.includes('.m3u8')) return null;
  return url;
}

export function refererForHikkaPageUrl(pageUrl: string): string {
  try {
    const u = new URL(pageUrl);
    return `${u.origin}/`;
  } catch {
    return 'https://ashdi.vip/';
  }
}

export async function extractM3u8FromEmbedPage(pageUrl: string): Promise<string | null> {
  const page = pageUrl.trim();
  if (!page.startsWith('http')) return null;

  const res = await fetch(page, {
    headers: {
      ...FETCH_HEADERS,
      Referer: refererForHikkaPageUrl(page),
    },
    redirect: 'follow',
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const html = await res.text();

  if (isMoonanimeHost(page)) {
    const moon = extractMoonanimeM3u8FromHtml(html);
    if (moon) return moon;
  }

  const playerMatch = M3U8_IN_PLAYERJS.exec(html);
  if (playerMatch?.[1]) return playerMatch[1].trim();
  const generic = M3U8_GENERIC.exec(html);
  return generic?.[1]?.trim() ?? null;
}
