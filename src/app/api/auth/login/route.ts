import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { LoginBodySchema } from '@/shared/schemas/api';

export async function POST(req: Request) {
  try {
    await connectDB();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const result = LoginBodySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed.', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 404 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          message: 'Please verify your email before logging in.',
          needVerification: true,
        },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      process.env.NEXT_JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.NEXT_JWT_REFRESH_SECRET!,
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
    console.error('Login error:', err);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
