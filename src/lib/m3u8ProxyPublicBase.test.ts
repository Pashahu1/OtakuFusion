import { describe, expect, it } from 'vitest';

import { resolveStreamPlaybackUrl } from './m3u8ProxyPublicBase';

describe('resolveStreamPlaybackUrl', () => {
  const headers = { Referer: 'https://anikai.to/' };

  it('returns Crysoline-hosted streams directly', () => {
    const url = 'https://proxy.crysoline.moe/proxy/https://cdn.example/stream.m3u8';
    expect(resolveStreamPlaybackUrl(url, headers)).toBe(url);
  });

  it('wraps third-party streams in same-origin m3u8 proxy', () => {
    const url = 'https://cdn.example.com/stream.m3u8';
    const resolved = resolveStreamPlaybackUrl(url, headers, () => false, 'https://otakufusion.com');

    expect(resolved).toContain('https://otakufusion.com/api/m3u8-proxy');
    expect(resolved).toContain(encodeURIComponent(url));
  });

  it('uses direct host predicate when CORS allows browser fetch', () => {
    const url = 'https://direct.example/stream.m3u8';
    expect(resolveStreamPlaybackUrl(url, headers, (candidate) => candidate === url)).toBe(url);
  });
});
