import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/mailer';
export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required.' },
        { status: 400 }
      );
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    if (user.isVerified) {
      return NextResponse.json(
        { message: 'Email is already verified.' },
        { status: 200 }
      );
    }
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();
    await sendVerificationEmail(user.email, verificationCode);
    return NextResponse.json(
      { message: 'Verification code resent.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Resend verification error:', err);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
