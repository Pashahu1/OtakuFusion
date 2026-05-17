import type { HikkaEpTokenPayload, HikkaWatchSource } from '@/services/hikka/hikkaTypes';

const PREFIX = 'hk1:';

export function encodeHikkaEpToken(payload: HikkaEpTokenPayload): string {
  const json = JSON.stringify({
    s: payload.source,
    t: payload.team,
    u: payload.pageUrl,
  });
  return PREFIX + Buffer.from(json, 'utf8').toString('base64url');
}

export function decodeHikkaEpToken(token: string): HikkaEpTokenPayload | null {
  const raw = token.trim();
  if (!raw.startsWith(PREFIX)) return null;
  try {
    const json = Buffer.from(raw.slice(PREFIX.length), 'base64url').toString('utf8');
    const o = JSON.parse(json) as { s?: string; t?: string; u?: string };
    const source = o.s?.trim() as HikkaWatchSource | undefined;
    const team = o.t?.trim() ?? '';
    const pageUrl = o.u?.trim() ?? '';
    if (source !== 'ashdi' && source !== 'tortuga' && source !== 'moon') return null;
    if (!team || !pageUrl.startsWith('http')) return null;
    return { source, team, pageUrl };
  } catch {
    return null;
  }
}
