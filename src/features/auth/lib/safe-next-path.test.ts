import { describe, expect, it } from 'vitest';

import {
  readNextPathFromSearch,
  resolveReturnPath,
  sanitizeNextPath,
  withNextQuery,
} from './safe-next-path';

describe('sanitizeNextPath', () => {
  it('keeps a watch play URL with episode query', () => {
    expect(sanitizeNextPath('/watch/one-piece/play?ep=8')).toBe(
      '/watch/one-piece/play?ep=8',
    );
  });

  it('rejects absolute, protocol-relative, and auth loops', () => {
    expect(sanitizeNextPath('https://evil.example/phish')).toBeNull();
    expect(sanitizeNextPath('//evil.example/phish')).toBeNull();
    expect(sanitizeNextPath('/\\evil.example')).toBeNull();
    expect(sanitizeNextPath('/auth/login')).toBeNull();
    expect(sanitizeNextPath('/auth/register?next=/watch/x/play')).toBeNull();
  });
});

describe('withNextQuery / resolveReturnPath', () => {
  it('appends a sanitized next param', () => {
    expect(withNextQuery('/auth/login', '/watch/x/play?ep=2')).toBe(
      '/auth/login?next=%2Fwatch%2Fx%2Fplay%3Fep%3D2',
    );
  });

  it('prefers an existing next query over the auth pathname', () => {
    expect(resolveReturnPath('/auth/register', '?next=%2Fwatch%2Fx%2Fplay')).toBe(
      '/watch/x/play',
    );
  });

  it('uses the current watch path when there is no next query', () => {
    expect(resolveReturnPath('/watch/x/play', '?ep=8')).toBe('/watch/x/play?ep=8');
  });

  it('reads next from a query string', () => {
    expect(readNextPathFromSearch('?next=%2Fprofile%2Ffavorites')).toBe(
      '/profile/favorites',
    );
  });
});
