import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export const runtime = 'nodejs';

export async function POST() {
  await connectDB();

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch {
    return NextResponse.json(
      { message: 'Invalid refresh token' },
      { status: 401 }
    );
  }

  const user = await User.findById(payload.id);
  if (!user || user.refreshToken !== refreshToken) {
    return NextResponse.json(
      { message: 'Invalid refresh token' },
      { status: 401 }
    );
  }

  const newAccessToken = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m' }
  );

  const response = NextResponse.json({ message: 'Refreshed' });

  response.cookies.set('accessToken', newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15,
  });

  return response;
}
