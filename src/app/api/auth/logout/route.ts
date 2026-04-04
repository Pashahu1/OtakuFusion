import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { authSessionCookieDefaults } from '@/lib/auth-cookie-options';

export const runtime = 'nodejs';

export async function POST() {
  await connectDB();

  const cookieStore = await cookies();

  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (refreshToken) {
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
  }

  const response = NextResponse.json({ message: 'Logged out' });

  response.cookies.set('accessToken', '', {
    ...authSessionCookieDefaults,
    maxAge: 0,
  });

  response.cookies.set('refreshToken', '', {
    ...authSessionCookieDefaults,
    maxAge: 0,
  });

  return response;
}
