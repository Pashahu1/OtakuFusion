import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { authSessionCookieDefaults } from '@/lib/auth-cookie-options';

/**
 * Edge middleware не може надійно використовувати `jsonwebtoken` (Node crypto).
 * `jose` працює в Edge — інакше verify/sign падають у runtime і всі protected
 * маршрути редіректять на логін.
 */
function getMiddlewareJwtSecrets(): { access: string; refresh: string } | null {
  const access =
    process.env.NEXT_JWT_ACCESS_SECRET?.trim() ||
    process.env.JWT_ACCESS_SECRET?.trim();
  const refresh =
    process.env.NEXT_JWT_REFRESH_SECRET?.trim() ||
    process.env.JWT_REFRESH_SECRET?.trim();
  if (!access || !refresh) return null;
  return { access, refresh };
}

function payloadIdToString(id: unknown): string | null {
  if (typeof id === 'string' && id.length > 0) return id;
  if (id != null && typeof id === 'object' && '$oid' in id) {
    const oid = (id as { $oid?: string }).$oid;
    return typeof oid === 'string' && oid.length > 0 ? oid : null;
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const secrets = getMiddlewareJwtSecrets();
  if (!secrets) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const accessKey = new TextEncoder().encode(secrets.access);
  const refreshKey = new TextEncoder().encode(secrets.refresh);

  const accessToken = req.cookies.get('accessToken')?.value;
  if (accessToken) {
    try {
      await jwtVerify(accessToken, accessKey, { algorithms: ['HS256'] });
      return NextResponse.next();
    } catch {
      // пробуємо оновити з refresh
    }
  }

  const refreshToken = req.cookies.get('refreshToken')?.value;
  if (refreshToken) {
    try {
      const { payload } = await jwtVerify(refreshToken, refreshKey, {
        algorithms: ['HS256'],
      });
      const id = payloadIdToString(payload.id);
      if (!id) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }

      const newAccessToken = await new SignJWT({ id })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(accessKey);

      const res = NextResponse.next();
      res.cookies.set('accessToken', newAccessToken, {
        ...authSessionCookieDefaults,
        maxAge: 60 * 15,
      });
      return res;
    } catch {
      // ignore
    }
  }

  return NextResponse.redirect(new URL('/auth/login', req.url));
}

export const config = {
  matcher: ['/profile/:path*', '/admin/:path*'],
};
