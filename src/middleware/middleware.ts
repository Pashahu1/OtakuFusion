import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  try {
    jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: ['/profile/:path*', '/favorites/:path*', '/admin/:path*'],
};
