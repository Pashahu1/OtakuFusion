import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { env } from '@/lib/env';
import { authSessionCookieDefaults } from '@/lib/auth-cookie-options';
import { jsonMessage } from '@/lib/http';

export const runtime = 'nodejs';

interface RefreshTokenPayload {
  id: string;
}

export async function POST() {
  await connectDB();

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return jsonMessage('No refresh token.', 401);
  }

  let payload: RefreshTokenPayload;
  try {
    payload = jwt.verify(
      refreshToken,
      env.NEXT_JWT_REFRESH_SECRET
    ) as RefreshTokenPayload;
  } catch {
    return jsonMessage('Invalid refresh token.', 401);
  }

  const user = await User.findById(payload.id);
  if (!user || user.refreshToken !== refreshToken) {
    return jsonMessage('Invalid refresh token.', 401);
  }

  const newAccessToken = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    env.NEXT_JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const response = NextResponse.json({ message: 'Refreshed' });

  response.cookies.set('accessToken', newAccessToken, {
    ...authSessionCookieDefaults,
    maxAge: 60 * 15,
  });

  return response;
}
