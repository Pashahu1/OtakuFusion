const M3U8_IN_PLAYERJS =
  /file\s*:\s*['"](https?:\/\/[^'"]+\.m3u8[^'"]*)['"]/i;

const M3U8_GENERIC = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i;

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
};

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
  const playerMatch = M3U8_IN_PLAYERJS.exec(html);
  if (playerMatch?.[1]) return playerMatch[1].trim();
  const generic = M3U8_GENERIC.exec(html);
  return generic?.[1]?.trim() ?? null;
}
