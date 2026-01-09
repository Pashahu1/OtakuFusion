import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json(
        { message: 'Email and code are required.' },
        { status: 400 }
      );
    }
    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: new Date() },
    });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired code.' },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    
    await user.save();
    return NextResponse.json(
      { message: 'Email verified successfully.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Verify email error:', err);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
