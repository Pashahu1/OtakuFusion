import { afterEach, describe, expect, it, vi } from 'vitest';

import { completeAnikotoClientStream } from './fetch-anikoto-client-stream';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('completeAnikotoClientStream', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('asks the browser for the playlist when the server could not', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('server=hd-1')) return jsonResponse({ success: true, data: {} });
      return jsonResponse({
        success: true,
        data: {
          m3u8: 'https://megap.shiora.top/master.m3u8',
          referer: 'https://megaplay.buzz/',
          intro: { start: 12, end: 90 },
          outro: { start: 0, end: 0 },
          subtitles: [
            {
              file: 'https://subs.example/ja.vtt',
              label: 'Japanese',
              kind: 'captions',
            },
          ],
        },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const playback = await completeAnikotoClientStream({
      id: 'demon-slayer-kimetsu-no-yaiba-rzepv',
      episode: 1,
      type: 'sub',
      servers: ['hd-1', 'hd-2'],
    });

    expect(playback.stream.url).toBe('https://megap.shiora.top/master.m3u8');
    expect(playback.stream.lang).toBe('sub');
    expect(playback.stream.request_headers).toEqual({ Referer: 'https://megaplay.buzz/' });
    expect(playback.segments.intro).toEqual({ start: 12, end: 90 });
    expect(playback.stream.tracks).toHaveLength(1);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('server=hd-2');
  });

  it('rejects an English playlist that matches Japanese', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          success: true,
          data: {
            m3u8: 'https://megap.shiora.top/same.m3u8',
            referer: 'https://megaplay.buzz/',
          },
        }),
      ),
    );

    await expect(
      completeAnikotoClientStream({
        id: 'same-file',
        episode: 1,
        type: 'dub',
        servers: ['hd-1'],
      }),
    ).rejects.toThrow('no_working_source|anikoto_dub_not_available');
  });
});
