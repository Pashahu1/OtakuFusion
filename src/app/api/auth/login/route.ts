import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { LoginBodySchema } from '@/shared/schemas/api';
import { env } from '@/lib/env';
import {
  handleRouteError,
  jsonMessage,
  parseWithSchema,
  readJsonBody,
} from '@/lib/http';

export async function POST(req: Request) {
  try {
    await connectDB();

    const json = await readJsonBody(req);
    if (!json.ok) return json.response;

    const parsed = parseWithSchema(LoginBodySchema, json.data);
    if (!parsed.ok) return parsed.response;

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });

    if (!user) {
      return jsonMessage('Invalid email or password.', 404);
    }

    if (!user.isVerified) {
      return jsonMessage('Please verify your email before logging in.', 403, {
        needVerification: true,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return jsonMessage('Invalid email or password.', 401);
    }

    const accessToken = jwt.sign(
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
    const refreshToken = jwt.sign(
      { id: user._id },
      env.NEXT_JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    user.refreshToken = refreshToken;
    await user.save();

    const userPayload = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      avatar: user.avatar ?? '',
      role: user.role,
      isVerified: user.isVerified,
    };

    const response = NextResponse.json(
      { message: 'Login successful', accessToken, user: userPayload },
      { status: 200 }
    );

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'strict',
      maxAge: 60 * 15,
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    return handleRouteError(err, 'Login error:');
  }
}
