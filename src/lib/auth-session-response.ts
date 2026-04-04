import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { env } from '@/lib/env';
import { authSessionCookieDefaults } from '@/lib/auth-cookie-options';

export interface SessionUserDoc {
  _id: { toString(): string };
  username: string;
  email: string;
  avatar?: string | null;
  role: string;
  isVerified: boolean;
  refreshToken?: string | null;
  save: () => Promise<unknown>;
}

export function userToClientPayload(user: SessionUserDoc) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    avatar: user.avatar ?? '',
    role: user.role,
    isVerified: user.isVerified,
  };
}

export async function createSessionResponse(
  user: SessionUserDoc,
  options: { message: string; status: number },
): Promise<NextResponse> {
  const accessToken = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    env.NEXT_JWT_ACCESS_SECRET,
    { expiresIn: '15m' },
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    env.NEXT_JWT_REFRESH_SECRET,
    { expiresIn: '7d' },
  );
  user.refreshToken = refreshToken;
  await user.save();

  const userPayload = userToClientPayload(user);

  const response = NextResponse.json(
    { message: options.message, accessToken, user: userPayload },
    { status: options.status },
  );

  response.cookies.set('accessToken', accessToken, {
    ...authSessionCookieDefaults,
    maxAge: 60 * 15,
  });

  response.cookies.set('refreshToken', refreshToken, {
    ...authSessionCookieDefaults,
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
