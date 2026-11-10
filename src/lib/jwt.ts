import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export const ACCESS_TOKEN_EXPIRES = '15m';
export const REFRESH_TOKEN_EXPIRES = '7d';
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface AccessTokenClaims {
  id: string;
  username?: string;
  email?: string;
  role?: string;
  isVerified?: boolean;
}

function encodeSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export function jwtSubjectId(id: unknown): string | null {
  if (typeof id === 'string' && id.length > 0) return id;
  if (typeof id === 'object' && id != null && 'toString' in id) {
    const value = String((id as { toString(): string }).toString());
    if (value && value !== '[object Object]') return value;
  }
  if (typeof id === 'object' && id != null && '$oid' in id) {
    const oid = (id as { $oid?: string }).$oid;
    return typeof oid === 'string' && oid.length > 0 ? oid : null;
  }
  return null;
}

export async function signAccessToken(
  claims: AccessTokenClaims,
  secret: string,
): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES)
    .sign(encodeSecret(secret));
}

export async function signRefreshToken(id: string, secret: string): Promise<string> {
  return new SignJWT({ id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES)
    .sign(encodeSecret(secret));
}

export async function verifyHs256Jwt(
  token: string,
  secret: string,
): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, encodeSecret(secret), {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function verifyAccessTokenId(
  token: string,
  secret: string,
): Promise<string | null> {
  try {
    const payload = await verifyHs256Jwt(token, secret);
    return jwtSubjectId(payload.id);
  } catch {
    return null;
  }
}
