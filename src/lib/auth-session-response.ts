import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { authSessionCookieDefaults } from '@/lib/auth-cookie-options';
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  signAccessToken,
  signRefreshToken,
} from '@/lib/jwt';

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
  const id = user._id.toString();
  const accessToken = await signAccessToken(
    {
      id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    env.NEXT_JWT_ACCESS_SECRET,
  );
  const refreshToken = await signRefreshToken(id, env.NEXT_JWT_REFRESH_SECRET);
  user.refreshToken = refreshToken;
  await user.save();

  const userPayload = userToClientPayload(user);

  const response = NextResponse.json(
    { message: options.message, accessToken, user: userPayload },
    { status: options.status },
  );

  response.cookies.set('accessToken', accessToken, {
    ...authSessionCookieDefaults,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });

  response.cookies.set('refreshToken', refreshToken, {
    ...authSessionCookieDefaults,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });

  return response;
}
