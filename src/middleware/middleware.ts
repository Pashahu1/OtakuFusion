import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const PROTECTED_USER_PATHS = ['/profile', '/favorites'];
const ADMIN_PATH = ['/admin'];

function isPathMatch(pathname: string, path: string[]) {
  return path.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isUserProtected = isPathMatch(pathname, PROTECTED_USER_PATHS);
  const isAdminProtected = isPathMatch(pathname, ADMIN_PATH);

  if (!isUserProtected && !isAdminProtected) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get('accessToken')?.value;

  if (!accessToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('form', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const payLoad = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!) as {
      id: string;
      role?: string;
    };
    if (isAdminProtected) {
      if (payLoad.role !== 'admin') {
        const url = req.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch (err) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('form', pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/profile/:path*', '/favorites/:path*', '/admin/:path*'],
};
