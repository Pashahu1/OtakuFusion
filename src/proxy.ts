import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authSessionCookieDefaults } from '@/lib/auth-cookie-options';
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  jwtSubjectId,
  signAccessToken,
  verifyHs256Jwt,
} from '@/lib/jwt';

function getProxyJwtSecrets(): { access: string; refresh: string } | null {
  const access =
    process.env.NEXT_JWT_ACCESS_SECRET?.trim() ||
    process.env.JWT_ACCESS_SECRET?.trim();
  const refresh =
    process.env.NEXT_JWT_REFRESH_SECRET?.trim() ||
    process.env.JWT_REFRESH_SECRET?.trim();
  if (!access || !refresh) return null;
  return { access, refresh };
}

export async function proxy(req: NextRequest) {
  const secrets = getProxyJwtSecrets();
  if (!secrets) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const accessToken = req.cookies.get('accessToken')?.value;
  if (accessToken) {
    try {
      await verifyHs256Jwt(accessToken, secrets.access);
      return NextResponse.next();
    } catch {
      // try refresh token update
    }
  }

  const refreshToken = req.cookies.get('refreshToken')?.value;
  if (refreshToken) {
    try {
      const payload = await verifyHs256Jwt(refreshToken, secrets.refresh);
      const id = jwtSubjectId(payload.id);
      if (!id) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }

      const newAccessToken = await signAccessToken({ id }, secrets.access);
      const res = NextResponse.next();
      res.cookies.set('accessToken', newAccessToken, {
        ...authSessionCookieDefaults,
        maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
      });
      return res;
    } catch {
      // ignore
    }
  }

  return NextResponse.redirect(new URL('/auth/login', req.url));
}

export const config = {
  matcher: ['/profile/:path*'],
};
