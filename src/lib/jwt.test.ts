import { describe, expect, it } from 'vitest';

import {
  jwtSubjectId,
  signAccessToken,
  signRefreshToken,
  verifyAccessTokenId,
  verifyHs256Jwt,
} from './jwt';

const SECRET = 'test-access-secret-at-least-32-chars';
const OTHER = 'other-access-secret-at-least-32-ch';

describe('jwt (jose)', () => {
  it('round-trips an access token', async () => {
    const token = await signAccessToken(
      {
        id: '507f1f77bcf86cd799439011',
        username: 'pavlo',
        email: 'a@b.c',
        role: 'user',
        isVerified: true,
      },
      SECRET,
    );
    const payload = await verifyHs256Jwt(token, SECRET);
    expect(payload.id).toBe('507f1f77bcf86cd799439011');
    expect(payload.username).toBe('pavlo');
    expect(await verifyAccessTokenId(token, SECRET)).toBe('507f1f77bcf86cd799439011');
  });

  it('round-trips a refresh token', async () => {
    const token = await signRefreshToken('user-1', SECRET);
    const payload = await verifyHs256Jwt(token, SECRET);
    expect(jwtSubjectId(payload.id)).toBe('user-1');
  });

  it('rejects the wrong secret', async () => {
    const token = await signAccessToken({ id: 'user-1' }, SECRET);
    await expect(verifyHs256Jwt(token, OTHER)).rejects.toThrow();
    expect(await verifyAccessTokenId(token, OTHER)).toBeNull();
  });

  it('reads Mongo-style ids', () => {
    expect(jwtSubjectId('abc')).toBe('abc');
    expect(jwtSubjectId({ $oid: '507f1f77bcf86cd799439011' })).toBe(
      '507f1f77bcf86cd799439011',
    );
    expect(jwtSubjectId({ toString: () => '507f1f77bcf86cd799439011' })).toBe(
      '507f1f77bcf86cd799439011',
    );
    expect(jwtSubjectId(null)).toBeNull();
  });
});
