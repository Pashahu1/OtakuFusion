import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectDB();
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...req] = c.trim().split('=');
        return [key, decodeURIComponent(req.join('='))];
      })
    );

    const refreshToken = cookies['refreshToken'];

    if (refreshToken) {
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }

    const response = NextResponse.json(
      { message: 'Logged out successfully.' },
      { status: 200 }
    );

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('accessToken', '', {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
