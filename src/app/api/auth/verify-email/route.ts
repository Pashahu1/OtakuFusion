import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    if (!token) {
      return NextResponse.json(
        { message: 'Token is required.' },
        { status: 400 }
      );
    }
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });
    if (!user) {
      return NextResponse.json(
        { message: 'Token is invalid or expired.' },
        { status: 400 }
      );
    }
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/verify-success`
    );
  } catch (err) {
    console.error('Verify email error:', err);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
