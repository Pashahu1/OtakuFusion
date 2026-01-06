import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectDB();
    const cookiesHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookiesHeader.split(';').map((cookie) => {
        const [key, ...rest] = cookie.split('=');
        return [key, decodeURIComponent(rest.join('='))];
      })
    );
    const refreshToken = cookies['refreshToken'];
    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token is missing.' },
        { status: 401 }
      );
    }
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid refresh token.' },
        { status: 401 }
      );
    }
    let payLoad: any;

    try {
      payLoad = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        id: string;
      };
    } catch (err) {
      return NextResponse.json(
        { message: 'Invalid or expired refresh token.' },
        { status: 401 }
      );
    }
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );

    return NextResponse.json(
      { message: 'Token refreshed successfully', accessToken },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error during token refresh:', err);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
