import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { env } from '@/lib/env';
import { authSessionCookieDefaults } from '@/lib/auth-cookie-options';
import { jsonMessage } from '@/lib/http';
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  jwtSubjectId,
  signAccessToken,
  verifyHs256Jwt,
} from '@/lib/jwt';

export const runtime = 'nodejs';

export async function POST() {
  await connectDB();

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return jsonMessage('No refresh token.', 401);
  }

  let id: string | null;
  try {
    const payload = await verifyHs256Jwt(refreshToken, env.NEXT_JWT_REFRESH_SECRET);
    id = jwtSubjectId(payload.id);
  } catch {
    return jsonMessage('Invalid refresh token.', 401);
  }

  if (!id) {
    return jsonMessage('Invalid refresh token.', 401);
  }

  const user = await User.findById(id);
  if (!user || user.refreshToken !== refreshToken) {
    return jsonMessage('Invalid refresh token.', 401);
  }

  const newAccessToken = await signAccessToken(
    {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    env.NEXT_JWT_ACCESS_SECRET,
  );

  const response = NextResponse.json({ message: 'Refreshed' });

  response.cookies.set('accessToken', newAccessToken, {
    ...authSessionCookieDefaults,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });

  return response;
}
