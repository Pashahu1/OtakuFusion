import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

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
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });

  return response;
}
