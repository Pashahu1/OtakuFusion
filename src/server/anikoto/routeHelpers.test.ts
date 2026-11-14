import { describe, expect, it } from 'vitest';

import { anikotoConfigGuard, anikotoGoneResponse } from '@/server/anikoto/routeHelpers';

describe('anikoto BFF retirement', () => {
  it('returns 410 gone regardless of env', async () => {
    const gone = anikotoGoneResponse();
    expect(gone.status).toBe(410);
    expect(gone.headers.get('Cache-Control')).toBe('no-store');
    await expect(gone.json()).resolves.toEqual({ error: 'anikoto_gone' });
  });

  it('does not reopen routes when ANIKOTO_API_BASE is set', async () => {
    const previous = process.env.ANIKOTO_API_BASE;
    process.env.ANIKOTO_API_BASE = 'https://example.invalid';
    try {
      const res = anikotoConfigGuard();
      expect(res.status).toBe(410);
      await expect(res.json()).resolves.toEqual({ error: 'anikoto_gone' });
    } finally {
      if (previous === undefined) delete process.env.ANIKOTO_API_BASE;
      else process.env.ANIKOTO_API_BASE = previous;
    }
  });
});
